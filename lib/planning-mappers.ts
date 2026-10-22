import { createEmptyClientResponse } from "@/lib/defaults";
import { PlanningBuilderValues } from "@/lib/validators";
import {
  Client,
  PlanningProposal,
  PlanningSession
} from "@/types/planning";

const splitLines = (value: string) =>
  value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export function sessionToBuilderValues(
  session: PlanningSession,
  client: Client
): PlanningBuilderValues {
  const photoRequirement = session.proposal.assetRequirements.find(
    (item) => item.id === "business-photos"
  );

  return {
    campaignType: session.proposal.campaignType ?? "lsa",
    clientName: client.name,
    slug: client.slug,
    logoUrl: client.logoUrl ?? "",
    selectedServicesText: session.proposal.services.selected.join("\n"),
    recommendedServicesText: session.proposal.services.recommended.join("\n"),
    weeklyBudget: session.proposal.budget.weeklyBudget,
    monthlyBudget: session.proposal.budget.monthlyBudget,
    minimumRequiredBudget: session.proposal.budget.minimumRequiredBudget,
    budgetNote: session.proposal.budget.recommendationNote,
    geoRecommendation: session.proposal.geoTarget.recommendation,
    locationsText: session.proposal.geoTarget.visibleLocations.join("\n"),
    recommendationsText: session.proposal.recommendations.join("\n"),
    photoInstructionsText:
      photoRequirement?.instructions ??
      "Please send us images that reflect your services, ongoing work, and business.",
    businessBioOptionsText: session.proposal.businessBioOptions
      .map((option) => option.label)
      .join("\n"),
    adsPreviewNote: session.proposal.adsPreviewNote,
    customQuestions: session.proposal.missingInfoChecklist.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description ?? "",
      required: item.required,
      fieldType: item.fieldType,
      optionsText: item.options?.join("\n") ?? ""
    }))
  };
}

export function builderValuesToProposal(
  values: PlanningBuilderValues,
  previous: PlanningProposal
): PlanningProposal {
  const selectedServices = splitLines(values.selectedServicesText);
  const recommendedServices = splitLines(values.recommendedServicesText || "");
  const locations = splitLines(values.locationsText);
  const recommendations = splitLines(values.recommendationsText);
  const bioOptions = splitLines(values.businessBioOptionsText);
  const customQuestions = values.customQuestions.map((question) => ({
    id: question.id,
    label: question.label,
    description: question.description || undefined,
    required: question.required,
    fieldType: question.fieldType,
    options: question.fieldType === "select" ? splitLines(question.optionsText) : undefined
  }));

  return {
    ...previous,
    campaignType: values.campaignType,
    title: values.campaignType === "lsa"
      ? "Local Service Ads - Google Guaranteed"
      : values.campaignType === "google_ads"
        ? "Google Ads"
        : "Local Service Ads + Google Ads",
    services: {
      selected: selectedServices,
      recommended: recommendedServices
    },
    budget: {
      weeklyBudget: values.weeklyBudget,
      monthlyBudget: values.monthlyBudget,
      minimumRequiredBudget: values.minimumRequiredBudget,
      recommendationNote: values.budgetNote
    },
    geoTarget: {
      recommendation: values.geoRecommendation,
      visibleLocations: locations
    },
    recommendations,
    missingInfoChecklist: customQuestions,
    adsPreviewNote: values.adsPreviewNote,
    assetRequirements: previous.assetRequirements.filter((item) => item.id !== "logo").map((item) => {
      if (item.id === "business-photos") {
        return {
          ...item,
          instructions: values.photoInstructionsText,
          acceptedFileTypes: ["JPEG", "PNG", "BMP", "ICO"],
          maxSizeMb: 10,
          minResolution: "640x640"
        };
      }

      return item;
    }),
    businessBioOptions: bioOptions.map((label) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      label
    }))
  };
}

export function createProposalFromBuilder(values: PlanningBuilderValues): PlanningProposal {
  const baseProposal = builderValuesToProposal(values, {
    campaignType: values.campaignType,
    title: "Local Service Ads - Google Guaranteed",
    subtitle: "SEM Plan & Setup",
    kpiContext:
      "These are the KPI and key objective results included in your monthly report so we can track progress and lead quality.",
    kpiBlocks: [
      {
        id: "ad-impressions",
        title: "Ad impressions",
        description: "The number of times your ad is shown."
      },
      {
        id: "top-impression-rate",
        title: "Top impression rate on Search",
        description: "The percentage of impressions where your ad appears above unpaid results."
      },
      {
        id: "absolute-top-rate",
        title: "Absolute top impression rate on Search",
        description: "The percentage of impressions where your ad appears as the first result in search."
      },
      {
        id: "total-lead-spend",
        title: "Total lead spend",
        description: "The amount spent on leads during the selected date range."
      }
    ],
    services: {
      selected: [],
      recommended: []
    },
    budget: {
      weeklyBudget: 1,
      monthlyBudget: 1,
      minimumRequiredBudget: 1,
      recommendationNote: ""
    },
    geoTarget: {
      recommendation: "",
      visibleLocations: []
    },
    assetRequirements: [
      {
        id: "business-photos",
        title: "Business & Work Photos",
        instructions: "Please send us images that reflect your services, ongoing work, and business.",
        acceptedFileTypes: ["JPEG", "PNG", "BMP", "ICO"],
        maxSizeMb: 10,
        minResolution: "640x640",
        required: true
      }
    ],
    businessBioOptions: [],
    adsPreviewNote: "",
    recommendations: [],
    missingInfoChecklist: []
  });

  return baseProposal;
}

export function createFreshResponse(proposal: PlanningProposal) {
  return createEmptyClientResponse(proposal);
}
