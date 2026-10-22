"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DefaultValues } from "react-hook-form";

import { AppShell } from "@/components/app-shell";
import { AdminPlanningForm } from "@/components/admin/admin-planning-form";
import { Button } from "@/components/ui/button";
import { createProposalFromBuilder } from "@/lib/planning-mappers";
import { usePlanningStore } from "@/lib/store";
import { slugify } from "@/lib/utils";
import { PlanningBuilderValues } from "@/lib/validators";

import { ChevronLeft } from "lucide-react";

const initialValues: DefaultValues<PlanningBuilderValues> = {
  campaignType: undefined,
  clientName: "",
  slug: "",
  logoUrl: "",
  selectedServicesText: "",
  recommendedServicesText: "",
  weeklyBudget: undefined,
  monthlyBudget: undefined,
  minimumRequiredBudget: undefined,
  budgetNote: "",
  geoRecommendation: "",
  locationsText: "",
  recommendationsText: "",
  photoInstructionsText: "",
  businessBioOptionsText: "",
  adsPreviewNote: "",
  customQuestions: []
};

export default function NewPlanningPage() {
  const router = useRouter();
  const { createPlanning } = usePlanningStore();

  const handleSubmit = async (values: PlanningBuilderValues) => {
    const session = await createPlanning({
      proposal: createProposalFromBuilder(values),
      clientName: values.clientName,
      slug: slugify(values.slug || values.clientName),
      logoUrl: values.logoUrl || undefined
    });

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
      subtitle="Prepare a client-ready LSA, Google Ads, or combined workflow from your internal SEM proposal."
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
