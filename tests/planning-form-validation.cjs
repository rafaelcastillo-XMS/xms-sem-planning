const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(path) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports,
    name => name.startsWith('@/') ? load(name.slice(2) + '.ts') : require(name));
  return module.exports;
}

const { planningBuilderSchema, clientResponseSchema } = load('lib/validators.ts');
const { createProposalFromBuilder, sessionToBuilderValues, builderValuesToProposal } = load('lib/planning-mappers.ts');
const { createEmptyClientResponse } = load('lib/defaults.ts');
const requiredValues = {
  campaignType: 'lsa',
  clientName: 'Test Company', slug: 'test-company', selectedServicesText: 'Service A\nService B',
  weeklyBudget: 500, monthlyBudget: 2200, minimumRequiredBudget: 2000,
  locationsText: 'Location A\nLocation B', businessBioOptionsText: 'Locally owned'
};

test('campaign selection loads the correct prefabricated questions without removing custom ones', () => {
  const { campaignQuestionTemplates, questionsForCampaignType } = load('lib/question-templates.ts');
  const custom = { id: 'client-launch-date', label: 'Preferred launch date?', description: '',
    required: false, fieldType: 'text', optionsText: '' };

  assert.deepEqual(campaignQuestionTemplates('lsa').map(question => question.id), ['lsa-message-leads']);
  assert.equal(campaignQuestionTemplates('google_ads').length, 7);
  assert.equal(campaignQuestionTemplates('both').length, 10);
  assert.deepEqual(
    questionsForCampaignType('both', [custom]).map(question => question.id),
    [
      'lsa-message-leads',
      'google-ads-campaign-focus',
      'google-ads-demographics-exclusions',
      'google-ads-target-audience',
      'google-ads-keywords',
      'google-ads-negative-keywords',
      'google-ads-preview-feedback',
      'google-ads-landing-page',
      'both-google-ads-budget',
      'both-google-ads-geo',
      'client-launch-date'
    ]
  );
  assert.deepEqual(
    questionsForCampaignType('lsa', questionsForCampaignType('google_ads', [custom])).map(question => question.id),
    ['lsa-message-leads', 'client-launch-date']
  );
});

test('each campaign type receives the correct wizard sections and always ends with review', () => {
  const { wizardStepsForCampaign } = load('lib/wizard-config.ts');
  const sections = campaignType => wizardStepsForCampaign(campaignType, true).map(step => step.section);

  assert.deepEqual(sections('lsa'), [
    'overview', 'services', 'budget', 'geo', 'hours', 'bio', 'team',
    'ads', 'recommendations', 'comments', 'review'
  ]);
  assert.deepEqual(sections('google_ads'), [
    'overview', 'services', 'budget', 'geo', 'team',
    'recommendations', 'comments', 'review'
  ]);
  assert.deepEqual(sections('both'), [
    'overview', 'services', 'budget', 'geo', 'hours', 'bio', 'team',
    'ads', 'recommendations', 'comments', 'review'
  ]);
});

test('business bio is required for plans that include LSA', () => {
  const withoutBio = { ...requiredValues, businessBioOptionsText: '' };
  assert.equal(planningBuilderSchema.safeParse(withoutBio).success, false);
  assert.equal(planningBuilderSchema.safeParse({ ...withoutBio, campaignType: 'google_ads' }).success, true);
  assert.equal(planningBuilderSchema.safeParse({ ...withoutBio, campaignType: 'both' }).success, false);
});

test('optional recommendations can be omitted or left blank when creating a plan', () => {
  for (const blank of [undefined, '', '   ']) {
    const values = planningBuilderSchema.parse({ ...requiredValues, budgetNote: blank,
      geoRecommendation: blank, photoInstructionsText: blank, adsPreviewNote: blank,
      recommendationsText: blank });
    const proposal = createProposalFromBuilder(values);
    assert.deepEqual(proposal.services.selected, ['Service A', 'Service B']);
    assert.deepEqual(proposal.geoTarget.visibleLocations, ['Location A', 'Location B']);
    assert.equal(proposal.budget.recommendationNote, '');
    assert.equal(proposal.geoTarget.recommendation, '');
    assert.deepEqual(proposal.recommendations, []);
    assert.equal(proposal.adsPreviewNote, '');
  }
});

test('required fields still block saving and identify the field to correct', () => {
  for (const key of ['clientName', 'slug', 'selectedServicesText', 'weeklyBudget',
    'monthlyBudget', 'minimumRequiredBudget', 'locationsText', 'businessBioOptionsText']) {
    const result = planningBuilderSchema.safeParse({ ...requiredValues, [key]: '' });
    assert.equal(result.success, false, key);
    assert.ok(result.error.issues.some(issue => issue.path[0] === key && issue.message.length > 0), key);
  }
});

test('editing preserves saved amounts and proposal options', () => {
  const proposal = createProposalFromBuilder(planningBuilderSchema.parse(requiredValues));
  const restored = sessionToBuilderValues({ proposal }, { name: 'Test Company', slug: 'test-company' });
  const edited = builderValuesToProposal(planningBuilderSchema.parse(restored), proposal);
  assert.deepEqual(edited.budget, proposal.budget);
  assert.deepEqual(edited.services, proposal.services);
  assert.deepEqual(edited.geoTarget, proposal.geoTarget);
  assert.deepEqual(edited.businessBioOptions, proposal.businessBioOptions);
});

test('client can select several locations and request budget changes through comments', () => {
  const proposal = createProposalFromBuilder(planningBuilderSchema.parse(requiredValues));
  const response = createEmptyClientResponse(proposal);
  assert.deepEqual(response.geoTarget.preferredLocations, []);
  response.geoTarget.preferredLocations = ['Location A', 'Location B'];
  response.budget = { decision: 'request_changes', comment: 'Please use $2100 per month.' };
  const saved = clientResponseSchema.parse(response);
  assert.deepEqual(saved.geoTarget.preferredLocations, ['Location A', 'Location B']);
  assert.equal(saved.budget.comment, 'Please use $2100 per month.');
  assert.equal(saved.budget.decision, 'request_changes');
});

test('legacy bio selections remain valid, with a maximum of six', () => {
  const proposal = createProposalFromBuilder(planningBuilderSchema.parse(requiredValues));
  const response = createEmptyClientResponse(proposal);
  response.businessBioSelection = [proposal.businessBioOptions[0].id, 'Bilingual team'];
  assert.deepEqual(clientResponseSchema.parse(response).businessBioSelection, response.businessBioSelection);
  response.businessBioSelection = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  assert.equal(clientResponseSchema.safeParse(response).success, true);
  response.businessBioSelection.push('Seven');
  assert.equal(clientResponseSchema.safeParse(response).success, false);
});
