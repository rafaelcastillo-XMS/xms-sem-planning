"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Laptop, FileText } from "lucide-react";

import { ReportActions } from "@/components/report-actions";
import { AppShell } from "@/components/app-shell";
import { AdminPlanningForm } from "@/components/admin/admin-planning-form";
import { ClientResponseView } from "@/components/admin/client-response-view";
import { Button } from "@/components/ui/button";
import { builderValuesToProposal, sessionToBuilderValues } from "@/lib/planning-mappers";
import { usePlanningStore } from "@/lib/store";
import { cn, slugify } from "@/lib/utils";
import { PlanningBuilderValues } from "@/lib/validators";


export default function AdminPlanningDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"proposal" | "results">("proposal");
  const {
    hydrated,
    getSessionById,
    getClientById,
    isSlugAvailable,
    updateClient,
    updateSessionProposal,
    updateSessionResponse
  } = usePlanningStore();

  const session = getSessionById(params.id);
  const client = session ? getClientById(session.clientId) : undefined;

  const defaultValues = useMemo<PlanningBuilderValues | null>(() => {
    if (!session || !client) return null;
    return sessionToBuilderValues(session, client);
  }, [session, client]);

  if (!hydrated) {
    return (
      <AppShell title="Planning Builder" subtitle="Loading session...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </AppShell>
    );
  }

  if (!session || !client || !defaultValues) {
    return (
      <AppShell title="Planning not found" subtitle="This planning session does not exist.">
        <Button onClick={() => router.push("/admin")}>Back to admin</Button>
      </AppShell>
    );
  }

  const isSlugLocked = session.status !== "draft";

  const handleSubmit = async (values: PlanningBuilderValues) => {
    const nextSlug = slugify(values.slug || values.clientName);

    // If slug changed, check if it's available
    if (nextSlug !== client.slug && !isSlugAvailable(nextSlug, client.id)) {
      alert("This slug is already taken by another client. Please choose a different one.");
      return;
    }

    await updateClient(client.id, {
      name: values.clientName,
      slug: isSlugLocked ? client.slug : nextSlug,
      logoUrl: values.logoUrl || undefined
    });

    const proposal = builderValuesToProposal(values, session.proposal);
    await updateSessionProposal(session.id, proposal);

    const filteredResponse = {
      ...session.response,
      businessBioSelection: session.response.businessBioSelection.filter((id) =>
        proposal.businessBioOptions.some((option) => option.id === id)
      ),
      geoTarget: {
        ...session.response.geoTarget,
        preferredLocations: session.response.geoTarget.preferredLocations.filter((location) =>
          proposal.geoTarget.visibleLocations.includes(location)
        )
      }
    };

    await updateSessionResponse(
      session.id,
      filteredResponse,
      session.status === "draft" ? "in_review" : session.status
    );

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to discard unsaved changes and return to the dashboard?")) {
      router.push("/admin");
    }
  };

  return (
    <AppShell
      title={`Planning Builder · ${client.name}`}
      subtitle="Edit proposal content and publish the client-facing wizard link."
      rightSlot={
        <div className="flex bg-slate-100/80 p-1 rounded-xl backdrop-blur-sm border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab("proposal")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "proposal" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Laptop className="h-3.5 w-3.5" />
            Proposal
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "results" ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Results
          </button>
        </div>
      }
    >
      <div className="mb-6">
        <Button asChild variant="link" className="p-0 h-auto text-slate-500 hover:text-primary transition-colors text-xs font-semibold">
          <Link href="/admin">
            <ChevronLeft className="mr-1 h-3 w-3" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {activeTab === "proposal" ? (
          <AdminPlanningForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            publicPath={`/client/${client.slug}`}
            onPreview={() => window.open(`/client/${client.slug}`, "_blank")}
            onCancel={handleCancel}
            isSlugLocked={isSlugLocked}
            isSuccess={isSuccess}
          />
        ) : (
          <div className="space-y-4"><ReportActions client={client} session={session} /><ClientResponseView session={session} /></div>
        )}
      </div>
    </AppShell>

  );
}

