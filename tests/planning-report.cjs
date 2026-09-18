/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(path) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', code)(module, module.exports, name => name.startsWith('@/') ? load(name.slice(2) + '.ts') : require(name));
  return module.exports;
}
const { buildPlanningReport } = load('lib/planning-report.ts');
const { readLogo } = load('lib/logo-upload.ts');
const { seededSessions } = load('mock-data/planning.ts');

test('report includes all response sections, escapes user text and rejects unsafe logo URLs', () => {
  const session = structuredClone(seededSessions[0]);
  session.status = 'submitted';
  session.response.finalComment = '<script>alert("x")</script> & final feedback';
  session.response.businessHours = [{ day: 'monday', isClosed: false, openTime: '09:00', closeTime: '18:00' }];
  session.response.missingInfoResponses.totalFieldworkers = 17;
  const html = buildPlanningReport({ name: 'A & B', slug: 'test', id: 'test', logoUrl: 'javascript:alert(1)' }, session);
  for (const text of ['Services', 'Budget', 'Geo targeting', 'Business hours', '09:00 – 18:00', 'Total fieldworkers', '17', 'Final client comments', 'A &amp; B', '&lt;script&gt;']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('Print / Save as PDF'));
});
test('draft reports never claim a final submission', () => {
  const session = structuredClone(seededSessions[0]);
  session.status = 'in_review';
  assert.match(buildPlanningReport({name:'Test',id:'test',slug:'test'},session), /Draft — not yet submitted/);
});
test('logo upload rejects unsupported files and oversize images before decoding', async () => {
  await assert.rejects(readLogo({type:'image/svg+xml',size:100}), /PNG, JPEG or WebP/);
  await assert.rejects(readLogo({type:'image/png',size:6*1024*1024}), /smaller than 5 MB/);
});
test('logo is resized to 512 pixels and bitmap is released', async () => {
  let closed = false;
  const canvas = { getContext: () => ({drawImage(){}}), toDataURL: () => 'data:image/png;base64,dGVzdA==' };
  global.createImageBitmap = async () => ({width:2048,height:1024,close(){closed=true;}});
  global.document = { createElement: () => canvas };
  const result = await readLogo({type:'image/png',size:100});
  assert.equal(canvas.width,512);
  assert.equal(canvas.height,256);
  assert.match(result,/^data:image\/png;base64,/);
  assert.equal(closed,true);
  delete global.createImageBitmap;
  delete global.document;
});
