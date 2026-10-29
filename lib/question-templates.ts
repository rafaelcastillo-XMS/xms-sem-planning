import type { CampaignType, MissingFieldType, MissingInfoItem } from "@/types/planning";

export interface BuilderQuestionTemplate {
  id: string;
  label: string;
  description: string;
  required: boolean;
  fieldType: MissingFieldType;
  optionsText: string;
}

const LSA_QUESTIONS: BuilderQuestionTemplate[] = [
  {
    id: "lsa-message-leads",
    label: "Would you like to receive message leads through Local Services Ads?",
    description: "Confirm whether customers should be able to contact the business by message in addition to calling.",
    required: true,
    fieldType: "select",
    optionsText: "Yes\nNo"
  }
];

const GOOGLE_ADS_QUESTIONS: BuilderQuestionTemplate[] = [
  {
    id: "google-ads-campaign-focus",
    label: "What is the primary focus of this Google Ads campaign?",
    description: "Describe the main service, offer, or business goal the campaign should prioritize.",
    required: true,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-demographics-exclusions",
    label: "Are there demographics or audiences we should prioritize or exclude?",
    description: "Include any relevant age groups, customer profiles, or audiences that should not see the ads.",
    required: false,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-target-audience",
    label: "Which customer profiles or audience categories should we prioritize?",
    description: "Describe the people most likely to need the promoted services.",
    required: true,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-keywords",
    label: "Which keywords, services, or searches should we target?",
    description: "Add the terms customers may use when searching for your services.",
    required: true,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-negative-keywords",
    label: "Which searches, services, or terms should we exclude?",
    description: "Add irrelevant searches or services you do not offer.",
    required: false,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-preview-feedback",
    label: "Do you have any comments or requested changes for the proposed Google Ads?",
    description: "Share changes to messaging, offers, calls to action, or other ad details.",
    required: false,
    fieldType: "textarea",
    optionsText: ""
  },
  {
    id: "google-ads-landing-page",
    label: "Which landing page should receive traffic from the ads?",
    description: "Provide the page URL or describe the page that should be created.",
    required: true,
    fieldType: "text",
    optionsText: ""
  }
];

const COMBINED_QUESTIONS: BuilderQuestionTemplate[] = [
  ...GOOGLE_ADS_QUESTIONS,
  ...LSA_QUESTIONS,
  {
    id: "both-google-ads-budget",
    label: "What Google Ads budget should be used in addition to the LSA budget?",
    description: "Enter the Google Ads amount and period so it remains separate from the LSA budget reviewed earlier.",
    required: true,
    fieldType: "text",
    optionsText: ""
  },
  {
    id: "both-google-ads-geo",
    label: "Should Google Ads use the same target locations as LSA?",
    description: "If the locations are different, list the locations that should apply only to Google Ads.",
    required: true,
    fieldType: "textarea",
    optionsText: ""
  }
];

const ALL_TEMPLATE_QUESTIONS = [...COMBINED_QUESTIONS];
const TEMPLATE_IDS = new Set(ALL_TEMPLATE_QUESTIONS.map((question) => question.id));

export function campaignQuestionTemplates(campaignType: CampaignType) {
  const questions = campaignType === "lsa"
    ? LSA_QUESTIONS
    : campaignType === "google_ads"
      ? GOOGLE_ADS_QUESTIONS
      : COMBINED_QUESTIONS;
  return questions.map((question) => ({ ...question }));
}

export function questionsForCampaignType(
  campaignType: CampaignType,
  currentQuestions: BuilderQuestionTemplate[]
) {
  const customQuestions = currentQuestions.filter((question) => !TEMPLATE_IDS.has(question.id));
  const currentTemplates = new Map(
    currentQuestions
      .filter((question) => TEMPLATE_IDS.has(question.id))
      .map((question) => [question.id, question])
  );
  const templates = campaignQuestionTemplates(campaignType).map(
    (question) => currentTemplates.get(question.id) ?? question
  );
  return [...templates, ...customQuestions];
}

export function isCampaignTemplateQuestion(id: string) {
  return TEMPLATE_IDS.has(id);
}

export function campaignTemplateLabel(id: string) {
  if (id.startsWith("google-ads-")) return "Google Ads preset";
  if (id.startsWith("lsa-")) return "LSA preset";
  return "Combined plan preset";
}

export function missingInfoQuestionsForCampaign(
  campaignType: CampaignType,
  currentQuestions: MissingInfoItem[]
) {
  const currentTemplates = new Map(
    currentQuestions
      .filter((question) => TEMPLATE_IDS.has(question.id))
      .map((question) => [question.id, question])
  );
  const templates = campaignQuestionTemplates(campaignType).map((question) =>
    currentTemplates.get(question.id) ?? {
      id: question.id,
      label: question.label,
      description: question.description,
      required: question.required,
      fieldType: question.fieldType,
      options: question.fieldType === "select" ? question.optionsText.split("\n") : undefined
    }
  );
  const customQuestions = currentQuestions.filter((question) => !TEMPLATE_IDS.has(question.id));
  return [...templates, ...customQuestions];
}
