"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AdminPlanningForm } from "@/components/admin/admin-planning-form";
import { Button } from "@/components/ui/button";
import { createFreshResponse, createProposalFromBuilder, sessionToBuilderValues } from "@/lib/planning-mappers";
import { usePlanningStore } from "@/lib/store";
import { slugify } from "@/lib/utils";
import { PlanningBuilderValues } from "@/lib/validators";

import { ChevronLeft } from "lucide-react";

export default function NewPlanningPage() {
  const router = useRouter();
  const { sessions, getClientById, createPlanning, updateSessionProposal, updateSessionResponse } =
    usePlanningStore();

  const initialValues = useMemo<PlanningBuilderValues>(() => {
    // ... logic remains same
    const templateSession = sessions[0];
    const templateClient = templateSession ? getClientById(templateSession.clientId) : undefined;

    if (templateSession && templateClient) {
      return {
        ...sessionToBuilderValues(templateSession, templateClient),
        clientName: "",
        slug: "",
        logoUrl: ""
      };
    }

    return {
      clientName: "",
      slug: "",
      logoUrl: "",
      selectedServicesText: "Gutter Installation",
      recommendedServicesText: "Gutter Repair",
      weeklyBudget: 300,
      monthlyBudget: 1300,
      minimumRequiredBudget: 1300,
      budgetNote: "Recommended budget range is 1500-1800/month.",
      geoRecommendation: "Prioritize high-converting zip codes first.",
      locationsText: "Jupiter\nStuart",
      recommendationsText: "Collect reviews weekly",
      logoInstructionsText: "Upload your current logo in high quality for branding consistency.",
      photoInstructionsText:
        "Please send us images that reflect your services, ongoing work, and business.",
      businessBioOptionsText: "Free Estimate\nFamily-owned & operated",
      adsPreviewNote: "Final ads may vary based on available content and variables."
    };
  }, [sessions, getClientById]);

  const handleSubmit = (values: PlanningBuilderValues) => {
    const session = createPlanning({
      clientName: values.clientName,
      slug: slugify(values.slug || values.clientName),
      logoUrl: values.logoUrl || undefined
    });

    const proposal = createProposalFromBuilder(values);
    const response = createFreshResponse(proposal);

    updateSessionProposal(session.id, proposal);
    updateSessionResponse(session.id, response, "in_review");

    router.push(`/admin/planning/${session.id}`);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel the creation of this new planning? Any information entered will be lost.")) {
      router.push("/admin");
    }
  };


  return (
    <AppShell
      title="Create New Planning"
      subtitle="Prepare a client-ready LSA workflow from your internal SEM proposal."
    >
      <div className="mb-6">
        <Button asChild variant="link" className="p-0 h-auto text-slate-500 hover:text-primary transition-colors text-xs font-semibold">
          <Link href="/admin">
            <ChevronLeft className="mr-1 h-3 w-3" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <AdminPlanningForm 
        defaultValues={initialValues} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        submitLabel="Create planning session" 
      />


    </AppShell>
  );
}
