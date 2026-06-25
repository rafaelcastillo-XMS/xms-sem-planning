"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanningStore } from "@/lib/store";
import {
  PlusCircle,
  RotateCcw,
  Settings,
  ExternalLink,
  Layers,
  Trash2
} from "lucide-react";

const statusLabel = {
  draft: "Draft",
  in_review: "In review",
  submitted: "Submitted"
};

export default function AdminPage() {
  const { sessions, getClientById, resetSeedData, deletePlanning, hydrated } =
    usePlanningStore();

  if (!hydrated) {
    return (
      <AppShell title="SEM Planning Admin" subtitle="Loading demo planning sessions...">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      subtitle="Create and manage LSA planning proposals before sharing with clients."
      rightSlot={
        <div className="flex gap-2">
          <Button asChild variant="default" className="shadow-lg shadow-primary/20">
            <Link href="/admin/planning/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New planning
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={() => {
              if (window.confirm("¿Estás seguro de que quieres reiniciar el demo? Se borrarán todos los cambios locales y volverás al estado inicial.")) {
                resetSeedData();
                window.location.reload();
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset demo
          </Button>

        </div>
      }
    >
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass rounded-3xl border border-dashed border-slate-300">
          <div className="bg-primary/5 p-6 rounded-full mb-4">
            <Layers className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No planning sessions found</h3>
          <p className="text-slate-500 mt-1 max-w-xs mx-auto">
            Get started by creating your first client proposal using the button above.
          </p>
          <Button asChild variant="default" className="mt-6 shadow-xl shadow-primary/20 h-12 px-8">
            <Link href="/admin/planning/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create First Plan
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const client = getClientById(session.clientId);
            if (!client) return null;

            return (
              <Card key={session.id} className="premium-card overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold">{client.name}</CardTitle>
                      <CardDescription className="text-xs font-mono bg-slate-100/50 px-1.5 py-0.5 rounded inline-block text-slate-500">
                        /{client.slug}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={session.status === "submitted" ? "success" : "secondary"}
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    >
                      {statusLabel[session.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="h-px w-full bg-slate-200/50" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button asChild size="sm" variant="default" className="flex-1 shadow-sm font-semibold">
                      <Link href={`/admin/planning/${session.id}`}>
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Open builder
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1 bg-white/50 backdrop-blur-sm border-slate-200">
                      <Link href={`/client/${client.slug}`} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Client URL
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Eliminar el planning de "${client.name}"? Esta acción no se puede deshacer.`
                          )
                        ) {
                          deletePlanning(session.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
