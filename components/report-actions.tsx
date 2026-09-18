"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client, PlanningSession } from "@/types/planning";

export function ReportActions({ client, session }: { client: Client; session: PlanningSession }) {
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const busy = useRef(false);
  const submitted = session.status === "submitted";
  return <div className="space-y-2">
    <div className="flex justify-end">
      <Button type="button" disabled={!submitted || downloading} onClick={async () => {
        if (busy.current) return;
        busy.current = true;
        setError("");
        setDownloading(true);
        try {
          const { downloadPlanningPdf } = await import("@/lib/planning-report");
          await downloadPlanningPdf(client, session);
        } catch {
          setError("No se pudo descargar el PDF. Inténtalo nuevamente.");
        } finally {
          busy.current = false;
          setDownloading(false);
        }
      }}>
        {downloading ? <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" /> : <Download aria-hidden="true" className="mr-2 h-4 w-4" />}
        {downloading ? "Generando PDF…" : "Descargar PDF"}
      </Button>
    </div>
    {!submitted && <p className="text-right text-xs text-muted-foreground">Disponible cuando el cliente envíe el planning.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
