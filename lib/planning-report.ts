import { jsPDF } from "jspdf";
import type { Client, PlanningSession } from "@/types/planning";

type ReportRow = [string, unknown];
interface ReportSection { title: string; rows: ReportRow[] }
const decision = (value: string) => value === "accept" ? "Accepted" : "Changes requested";
const display = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(display).join(", ") || "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === undefined || value === null || value === "" ? "Not provided" : String(value);
};

export function planningReportSections(client: Client, session: PlanningSession): ReportSection[] {
  const p = session.proposal;
  const r = session.response;
  return [
    { title: "Planning details", rows: [
      ["Status", session.status === "submitted" ? "Submitted" : "Not submitted"],
      ["Planning ID", session.id], ["Submitted at", session.submittedAt ? new Date(session.submittedAt).toISOString() : "Not submitted"],
      ["Contact phone", client.contactPhone], ["Introduction acknowledged", r.introAcknowledged]
    ] },
    { title: "Objectives & KPIs", rows: [["Context", p.kpiContext], ...p.kpiBlocks.map(k => [k.title, k.description] as ReportRow)] },
    { title: "Services", rows: [["Proposed services", p.services.selected], ["Recommended services", p.services.recommended], ["Client decision", decision(r.services.decision)], ["Client comments", r.services.comment]] },
    { title: "Budget", rows: [["Weekly budget (USD)", p.budget.weeklyBudget], ["Monthly budget (USD)", p.budget.monthlyBudget], ["Google minimum (USD)", p.budget.minimumRequiredBudget], ["Recommendation", p.budget.recommendationNote], ["Client decision", decision(r.budget.decision)], ["Requested budget", r.budget.requestedBudgetNote], ["Client comments", r.budget.comment]] },
    { title: "Geo targeting", rows: [["Proposed locations", p.geoTarget.visibleLocations], ["Recommendation", p.geoTarget.recommendation], ["Client decision", decision(r.geoTarget.decision)], ["Preferred locations", r.geoTarget.preferredLocations], ["Client comments", r.geoTarget.comment], ["Additional notes", r.geoTarget.note]] },
    { title: "Assets", rows: [...p.assetRequirements.map(a => [a.title + " instructions", a.instructions] as ReportRow), ["Client logo filename", r.assets.logoFileName], ["Photo filenames", r.assets.photos], ["Client comments", r.assets.comment], ["File availability", "Client asset filenames are recorded by the form; these files are not attached to this report."]] },
    { title: "Business hours", rows: [...r.businessHours.map(h => [h.day, h.isClosed ? "Closed" : `${h.openTime || "-"} - ${h.closeTime || "-"}`] as ReportRow), ["Hours notes", r.hoursNotes]] },
    { title: "Business profile & team", rows: [["Selected bio options", r.businessBioSelection.map(id => p.businessBioOptions.find(o => o.id === id)?.label || id)], ...Object.entries(r.missingInfoResponses).map(([id, value]) => [id === "totalFieldworkers" ? "Total fieldworkers" : p.missingInfoChecklist.find(i => i.id === id)?.label || id, value] as ReportRow), ["Acknowledged items", r.acknowledgedMissingItems.map(id => p.missingInfoChecklist.find(i => i.id === id)?.label || id)]] },
    { title: "Ads & recommendations", rows: [["Ads preview note", p.adsPreviewNote], ["Client feedback", r.adsPreviewComment], ["SEM recommendations", p.recommendations]] },
    { title: "Final client comments", rows: [["Comments", r.finalComment]] }
  ];
}

/** Paginated text PDF: no print dialog, pop-up or screenshot conversion. */
export function buildPlanningPdf(client: Client, session: PlanningSession, logoData?: string): jsPDF {
  if (session.status !== "submitted") throw new Error("El cliente debe enviar el planning antes de descargar el PDF.");
  const doc = new jsPDF({ format: "a4", unit: "mm", compress: true });
  doc.setProperties({ title: `${client.name} - SEM Planning`, author: "XMS", subject: "Client planning report" });
  const left = 18;
  const right = 192;
  const bottom = 277;
  let y = 24;
  const newPage = () => { doc.addPage(); y = 24; };
  const ensure = (height: number) => { if (y + height > bottom) newPage(); };
  // Built-in Helvetica supports western European text, including Spanish accents.
  const text = (value: unknown) => display(value).normalize("NFC").replace(/[\u2010-\u2015]/g, "-").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text("XMS / SEM PLANNING", left, y);
  y += 12;
  if (logoData && /^data:image\/(png|jpeg|webp);base64,/i.test(logoData)) {
    try {
      const properties = doc.getImageProperties(logoData);
      const scale = Math.min(30 / properties.width, 22 / properties.height);
      doc.addImage(logoData, right - properties.width * scale, 18, properties.width * scale, properties.height * scale);
    } catch { /* A legacy or damaged logo must not prevent report download. */ }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(15, 23, 42);
  for (const line of doc.splitTextToSize(text(client.name), 135) as string[]) {
    ensure(10); doc.text(line, left, y); y += 10;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const line of doc.splitTextToSize(text(`${session.proposal.title} / ${session.proposal.subtitle}`), right - left) as string[]) {
    ensure(6); doc.text(line, left, y); y += 6;
  }
  y += 6;
  for (const section of planningReportSections(client, session)) {
    ensure(30);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(left, y - 5, right - left, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(29, 78, 216);
    doc.text(section.title, left + 3, y + 1);
    y += 13;
    for (const [label, value] of section.rows) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const labels = doc.splitTextToSize(label, 48) as string[];
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text(value), 118) as string[];
      const count = Math.max(labels.length, lines.length);
      // Keep ordinary rows together, but split arbitrarily long comments safely.
      if (count * 4.8 + 4 < bottom - 24) ensure(count * 4.8 + 4);
      for (let i = 0; i < count; i++) {
        ensure(5);
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "bold");
        if (labels[i]) doc.text(labels[i], left, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
        if (lines[i]) doc.text(lines[i], left + 56, y);
        y += 4.8;
      }
      y += 4;
    }
    y += 5;
  }
  const total = doc.getNumberOfPages();
  const generated = new Date().toISOString().slice(0, 10);
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(left, 283, right, 283);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`XMS / ${generated}`, left, 289);
    doc.text(`${page} / ${total}`, right, 289, { align: "right" });
  }
  return doc;
}

export async function downloadPlanningPdf(client: Client, session: PlanningSession) {
  let logoData = client.logoUrl;
  if (logoData?.startsWith("https://")) {
    try {
      const response = await fetch(logoData, { signal: AbortSignal.timeout(5000), credentials: "omit" });
      if (!response.ok) throw new Error("Logo unavailable");
      const blob = await response.blob();
      if (blob.size > 5 * 1024 * 1024) throw new Error("Logo too large");
      logoData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { logoData = undefined; }
  }
  const doc = buildPlanningPdf(client, session, logoData);
  await doc.save(`sem-planning-${client.slug.replace(/[^a-z0-9-]/gi, "-")}.pdf`, { returnPromise: true });
}
