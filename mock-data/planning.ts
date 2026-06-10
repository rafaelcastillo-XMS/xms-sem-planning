import { createEmptyClientResponse } from "@/lib/defaults";
import { PlanningSession } from "@/types/planning";

const now = "2026-04-08T10:00:00.000Z";

const gutterGuardiansProposal: PlanningSession["proposal"] = {
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
    selected: ["Gutter Installation"],
    recommended: ["Gutter Repair"]
  },
  budget: {
    weeklyBudget: 315,
    monthlyBudget: 1368,
    minimumRequiredBudget: 1368,
    recommendationNote:
      "Your initial budget was $1,200/month, but LSA requires at least $1,368/month to trigger leads consistently. Our recommendation to stand out from competitors is between $1,500 and $1,800 per month."
  },
  geoTarget: {
    recommendation:
      "Include all of Martin County and St. Lucie County, excluding Fort Pierce.",
    visibleLocations: [
      "Jupiter",
      "Manalapan",
      "North Palm Beach",
      "Palm Beach Gardens",
      "Tequesta",
      "Wellington",
      "Stuart",
      "Port St Lucie",
      "West Palm Beach"
    ]
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
      instructions:
        "Please send us images that reflect your services, ongoing work, and business.",
      acceptedFileTypes: ["JPEG", "PNG", "BMP", "ICO"],
      maxSizeMb: 10,
      minResolution: "640x640",
      required: true
    }
  ],
  businessBioOptions: [
    "GAF Master Elite Contractor",
    "GAF Certified Contractor",
    "100% financing",
    "9 years in business",
    "Locally-owned & operated",
    "Family-owned & operated",
    "References available",
    "24/7 emergency service",
    "Free Estimate",
    "Free in-home estimate",
    "Military discount available",
    "Parts & labor guarantee",
    "Workmanship guarantee",
    "Lifetime guarantee",
    "Full warranty",
    "Extended warranty",
    "On-time guarantee",
    "Guaranteed repairs",
    "1 year guarantee",
    "Free consultation",
    "Beat or match price",
    "Professional service",
    "Veteran-owned & operated",
    "Woman-owned & operated",
    "Minority-owned & operated",
    "CertainTeed ShingleMaster",
    "CertainTeed SELECT ShingleMaster",
    "Weekend appointment by request",
    "Owens Corning Platinum Preferred",
    "Discounts available",
    "Flat rate pricing",
    "Eco-friendly"
  ].map((label) => ({
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    label
  })),
  adsPreviewNote:
    "Final ads may vary depending on available content, ad rank variables, and approval signals from Google.",
  recommendations: [
    "Maintain extended or 24/7 business hours.",
    "Keep business hours consistent with your Google Business Profile.",
    "Collect new reviews weekly and encourage detailed feedback.",
    "Send new project photos every week.",
    "Expand service areas where possible.",
    "Complete the Google background check process as soon as possible."
  ],
  missingInfoChecklist: []
};

const seedResponse = createEmptyClientResponse(gutterGuardiansProposal);
seedResponse.businessBioSelection = [
  "family-owned-operated",
  "references-available",
  "free-estimate"
];

export const seededSessions: PlanningSession[] = [
  {
    id: "plan_gutter_guardians_2026",
    clientId: "client_gutter_guardians",
    status: "in_review",
    proposal: gutterGuardiansProposal,
    response: seedResponse,
    createdAt: now,
    updatedAt: now
  }
];
