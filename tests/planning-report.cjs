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
const { buildPlanningPdf, planningReportSections } = load('lib/planning-report.ts');
const { readLogo } = load('lib/logo-upload.ts');
const { seededSessions } = load('mock-data/planning.ts');

test('PDF contains the full report and paginates long client responses', () => {
  const session = structuredClone(seededSessions[0]);
  session.status = 'submitted';
  session.response.finalComment = 'Comentario de José: revisión y aprobación. '.repeat(150);
  session.response.businessHours = [{ day: 'monday', isClosed: false, openTime: '09:00', closeTime: '18:00' }];
  session.response.missingInfoResponses.totalFieldworkers = 17;
  const client = { name: 'A & B / José', slug: 'test', id: 'test' };
  const sections = JSON.stringify(planningReportSections(client, session));
  for (const text of ['Services', 'Budget', 'Geo targeting', 'Business hours', '09:00 - 18:00', 'Total fieldworkers', '17', 'Final client comments']) assert.ok(sections.includes(text), text);
  const doc = buildPlanningPdf(client, session);
  assert.ok(doc.getNumberOfPages() >= 3);
  const pdf = doc.output('arraybuffer');
  assert.ok(Buffer.from(pdf).subarray(0, 5).equals(Buffer.from('%PDF-')));
  if (process.env.PDF_SAMPLE_PATH) fs.writeFileSync(process.env.PDF_SAMPLE_PATH, Buffer.from(pdf));
});
test('PDF generation rejects an unsubmitted planning', () => {
  const session = structuredClone(seededSessions[0]);
  session.status = 'in_review';
  assert.throws(() => buildPlanningPdf({name:'Test',id:'test',slug:'test'},session), /debe enviar el planning/);
});
test('invalid logo cannot block the PDF', () => {
  const session = structuredClone(seededSessions[0]);
  session.status = 'submitted';
  const doc = buildPlanningPdf({name:'Test',id:'test',slug:'test'},session,'data:image/png;base64,invalid');
  assert.ok(doc.getNumberOfPages() > 0);
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
