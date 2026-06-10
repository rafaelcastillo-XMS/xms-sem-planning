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
  const logoRequirement = session.proposal.assetRequirements.find(
    (item) => item.id === "logo"
  );
  const photoRequirement = session.proposal.assetRequirements.find(
    (item) => item.id === "business-photos"
  );

  return {
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
    logoInstructionsText:
      logoRequirement?.instructions ??
      "Upload your current logo in high quality for branding consistency.",
    photoInstructionsText:
      photoRequirement?.instructions ??
      "Please send us images that reflect your services, ongoing work, and business.",
    businessBioOptionsText: session.proposal.businessBioOptions
      .map((option) => option.label)
      .join("\n"),
    adsPreviewNote: session.proposal.adsPreviewNote
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

  return {
    ...previous,
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
    missingInfoChecklist: [],
    adsPreviewNote: values.adsPreviewNote,
    assetRequirements: previous.assetRequirements.map((item) => {
      if (item.id === "logo") {
        return {
          ...item,
          instructions: values.logoInstructionsText,
          acceptedFileTypes: ["JPEG", "PNG", "BMP", "ICO"],
          maxSizeMb: 10,
          minResolution: "640x640"
        };
      }

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
        id: "logo",
        title: "Company Logo",
        instructions: "Upload your current logo in high quality for branding consistency.",
        acceptedFileTypes: ["JPEG", "PNG", "BMP", "ICO"],
        maxSizeMb: 10,
        minResolution: "640x640",
        required: true
      },
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
