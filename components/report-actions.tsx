"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadPlanningReport, printPlanningReport } from "@/lib/planning-report";
import type { Client, PlanningSession } from "@/types/planning";

export function ReportActions({ client, session }: { client: Client; session: PlanningSession }) {
  const [error, setError] = useState("");
  if (session.status !== "submitted") return null;
  return <div className="space-y-2">
    <div className="flex flex-wrap justify-center gap-2">
      <Button type="button" variant="outline" onClick={() => downloadPlanningReport(client, session)}>Download report (HTML)</Button>
      <Button type="button" onClick={() => {
        setError("");
        try { printPlanningReport(client, session); }
        catch (e) { setError(e instanceof Error ? e.message : "Could not open report."); }
      }}>Print / Save as PDF</Button>
    </div>
    <p className="text-xs text-muted-foreground">For PDF, choose “Save as PDF” in the print dialog.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
