import type { Client, PlanningSession } from "@/types/planning";

const escapeHtml = (value: unknown): string => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const display = (value: unknown) => Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Yes" : "No") : value;
const row = (label: string, value: unknown) => `<div class="row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(display(value) || "Not provided")}</dd></div>`;
const section = (title: string, body: string) => `<section><h2>${escapeHtml(title)}</h2><dl>${body}</dl></section>`;
const decision = (value: string) => value === "accept" ? "Accepted" : "Changes requested";

export function buildPlanningReport(client: Client, session: PlanningSession): string {
  const p = session.proposal;
  const r = session.response;
  const safeLogo = client.logoUrl && (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(client.logoUrl) || /^https:\/\//i.test(client.logoUrl)) ? client.logoUrl : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(client.name)} — SEM Planning Report</title><style>
    *{box-sizing:border-box}body{font:14px/1.55 Arial,sans-serif;color:#172b4d;max-width:900px;margin:40px auto;padding:0 32px}header{border-bottom:4px solid #2563eb;padding-bottom:24px}header img{max-width:130px;max-height:80px;object-fit:contain;float:right}h1{font-size:30px;margin:8px 0}h2{font-size:18px;color:#1d4ed8;border-bottom:1px solid #dbeafe;padding-bottom:6px;break-after:avoid}p{color:#52627a}.row{display:grid;grid-template-columns:210px 1fr;gap:20px;padding:9px 0;border-bottom:1px solid #edf2f7;break-inside:avoid}dt{font-weight:bold}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}section{margin:28px 0}footer{margin-top:30px;color:#64748b;font-size:11px}.print{background:#2563eb;color:white;border:0;border-radius:6px;padding:12px;cursor:pointer}@page{size:A4;margin:16mm}@media print{body{margin:0;padding:0;max-width:none;font-size:10pt}.print{display:none}header img{max-width:100px}.row{grid-template-columns:160px 1fr}h1{font-size:24px}}@media(max-width:600px){.row{grid-template-columns:1fr;gap:3px}}
  </style></head><body><button class="print" onclick="window.print()">Print / Save as PDF</button><header>${safeLogo ? `<img src="${escapeHtml(safeLogo)}" alt="Company logo">` : ""}<p>XMS · SEM PLANNING</p><h1>${escapeHtml(client.name)}</h1><p>${escapeHtml(p.title)} · ${escapeHtml(p.subtitle)}</p></header>
  ${section("Planning details", row("Status", session.status === "submitted" ? "Submitted" : "Draft — not yet submitted") + row("Planning ID", session.id) + row("Submitted at", session.submittedAt ? new Date(session.submittedAt).toISOString() : "Not submitted") + row("Contact phone", client.contactPhone) + row("Introduction acknowledged", r.introAcknowledged))}
  ${section("Objectives & KPIs", row("Context", p.kpiContext) + p.kpiBlocks.map(k => row(k.title, k.description)).join(""))}
  ${section("Services", row("Proposed services", p.services.selected) + row("Recommended services", p.services.recommended) + row("Client decision", decision(r.services.decision)) + row("Client comments", r.services.comment))}
  ${section("Budget", row("Weekly budget (USD)", p.budget.weeklyBudget) + row("Monthly budget (USD)", p.budget.monthlyBudget) + row("Google minimum budget (USD)", p.budget.minimumRequiredBudget) + row("Recommendation", p.budget.recommendationNote) + row("Client decision", decision(r.budget.decision)) + row("Requested budget", r.budget.requestedBudgetNote) + row("Client comments", r.budget.comment))}
  ${section("Geo targeting", row("Proposed locations", p.geoTarget.visibleLocations) + row("Recommendation", p.geoTarget.recommendation) + row("Client decision", decision(r.geoTarget.decision)) + row("Preferred locations", r.geoTarget.preferredLocations) + row("Client comments", r.geoTarget.comment) + row("Additional notes", r.geoTarget.note))}
  ${section("Assets", p.assetRequirements.map(a => row(a.title + " instructions", a.instructions)).join("") + row("Client logo filename", r.assets.logoFileName) + row("Photo filenames", r.assets.photos) + row("Client comments", r.assets.comment) + row("File availability", "Client asset filenames are recorded by the form; these files are not attached to this report."))}
  ${section("Business hours", r.businessHours.map(h => row(h.day, h.isClosed ? "Closed" : `${h.openTime || "—"} – ${h.closeTime || "—"}`)).join("") + row("Hours notes", r.hoursNotes))}
  ${section("Business profile & team", row("Selected bio options", r.businessBioSelection.map(id => p.businessBioOptions.find(o => o.id === id)?.label || id)) + Object.entries(r.missingInfoResponses).map(([id, value]) => row(id === "totalFieldworkers" ? "Total fieldworkers" : p.missingInfoChecklist.find(i => i.id === id)?.label || id, value)).join("") + row("Acknowledged items", r.acknowledgedMissingItems.map(id => p.missingInfoChecklist.find(i => i.id === id)?.label || id)))}
  ${section("Ads & recommendations", row("Ads preview note", p.adsPreviewNote) + row("Client feedback", r.adsPreviewComment) + row("SEM recommendations", p.recommendations))}
  ${section("Final client comments", row("Comments", r.finalComment))}
  <footer>Generated ${escapeHtml(new Date().toISOString())} · XMS · SEM Planning</footer></body></html>`;
}

export function downloadPlanningReport(client: Client, session: PlanningSession) {
  const url = URL.createObjectURL(new Blob([buildPlanningReport(client, session)], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `sem-planning-${client.slug.replace(/[^a-z0-9-]/gi, "-")}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printPlanningReport(client: Client, session: PlanningSession) {
  const tab = window.open("", "_blank");
  if (!tab) throw new Error("Allow pop-ups to open the PDF report.");
  tab.opener = null;
  tab.document.open();
  tab.document.write(buildPlanningReport(client, session));
  tab.document.close();
  // Let logos finish loading before opening the native PDF/print dialog.
  void Promise.all(Array.from(tab.document.images).map(img => img.decode().catch(() => undefined)))
    .then(() => { if (!tab.closed) { tab.focus(); tab.print(); } });
}
