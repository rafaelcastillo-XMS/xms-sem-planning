const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(path) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
}

const { buildSubmissionNotification, sendSubmissionNotification } = load('lib/submission-notification.ts');

test('submission notification contains only the metadata needed by n8n', () => {
  const payload = buildSubmissionNotification({
    sessionId: 'session-1',
    clientName: 'Test Company',
    clientSlug: 'test-company',
    campaignType: 'both',
    submittedAt: '2026-11-16T15:30:00.000Z',
    adminUrl: 'https://planning.example/admin/planning/session-1'
  });

  assert.deepEqual(payload, {
    event: 'sem_planning.submitted',
    notificationId: 'session-1:2026-11-16T15:30:00.000Z',
    sessionId: 'session-1',
    client: { name: 'Test Company', slug: 'test-company' },
    campaign: 'Local Services Ads + Google Ads',
    submittedAt: '2026-11-16T15:30:00.000Z',
    adminUrl: 'https://planning.example/admin/planning/session-1'
  });
  assert.equal('response' in payload, false);
});

test('notification is skipped cleanly until the n8n webhook is configured', async () => {
  const result = await sendSubmissionNotification({}, '');
  assert.deepEqual(result, { sent: false, reason: 'not_configured' });
});

test('notification posts JSON to n8n with the configured secret header', async () => {
  let received;
  process.env.N8N_SUBMISSION_WEBHOOK_SECRET = 'test-secret';

  try {
    const request = async (url, options) => {
      received = { url, options };
      return { ok: true, status: 200 };
    };
    const result = await sendSubmissionNotification(
      { event: 'sem_planning.submitted', sessionId: 'session-1' },
      'https://n8n.example/webhook',
      request
    );
    assert.deepEqual(result, { sent: true });
    assert.equal(received.url, 'https://n8n.example/webhook');
    assert.equal(received.options.method, 'POST');
    assert.equal(received.options.headers['X-Webhook-Secret'], 'test-secret');
    assert.deepEqual(JSON.parse(received.options.body), {
      event: 'sem_planning.submitted',
      sessionId: 'session-1'
    });
  } finally {
    delete process.env.N8N_SUBMISSION_WEBHOOK_SECRET;
  }
});
