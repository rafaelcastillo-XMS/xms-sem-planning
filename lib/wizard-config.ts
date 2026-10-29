import { CampaignType, ReviewSection, WizardStep } from "@/types/planning";

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    section: "overview",
    title: "Overview",
    description: "Your plan, your feedback, one step at a time"
  },
  {
    id: 2,
    section: "services",
    title: "Services",
    description: "Confirm selected and recommended services"
  },
  {
    id: 3,
    section: "budget",
    title: "Budget & Bidding",
    description: "Review and approve budget plan"
  },
  {
    id: 4,
    section: "geo",
    title: "Geo Target",
    description: "Confirm service locations"
  },
  {
    id: 5,
    section: "hours",
    title: "Business Hours",
    description: "Confirm when customers can contact the business"
  },
  {
    id: 6,
    section: "bio",
    title: "Business Bio",
    description: "Choose up to 6 categories"
  },
  {
    id: 7,
    section: "team",
    title: "Team Information",
    description: "Tell us about your active field team"
  },
  {
    id: 8,
    section: "ads",
    title: "Ads Preview",
    description: "Leave optional ad feedback"
  },
  {
    id: 9,
    section: "recommendations",
    title: "SEM Team Recommendations",
    description: "Notes and recommendations from our SEM team"
  },
  {
    id: 10,
    section: "comments",
    title: "Additional Comments",
    description: "Share anything else before submission"
  },
  {
    id: 11,
    section: "review",
    title: "Review & Submit",
    description: "Final check before submission"
  }
];

export const REVIEW_SECTIONS: ReviewSection[] = [
  {
    id: "services",
    title: "Services",
    description: "Decision and comments"
  },
  {
    id: "budget",
    title: "Budget",
    description: "Budget confirmation and requests"
  },
  {
    id: "geo",
    title: "Geo Target",
    description: "Preferred areas and notes"
  },
  {
    id: "hours",
    title: "Business Hours",
    description: "Confirmed operating schedule"
  },
  {
    id: "bio",
    title: "Business Bio",
    description: "Selected categories"
  },
  {
    id: "team",
    title: "Team Information",
    description: "Field team size"
  },
  {
    id: "ads",
    title: "Ads Preview",
    description: "Feedback for ad style"
  },
  {
    id: "recommendations",
    title: "SEM Team Recommendations",
    description: "Notes from the SEM team"
  },
  {
    id: "comments",
    title: "Additional Comments",
    description: "Final client notes"
  }
];

const teamCopy = (campaignType: CampaignType) => campaignType === "google_ads"
  ? { title: "Google Ads Questions", description: "Complete the campaign setup questions" }
  : campaignType === "both"
    ? { title: "Google Ads & LSA Information", description: "Complete the questions for both campaign types" }
    : { title: "LSA Information", description: "Complete the Local Services Ads questions" };

const sectionIsAvailable = (section: WizardStep["section"], campaignType: CampaignType, hasQuestions: boolean) => {
  if (section === "hours" || section === "ads") return campaignType !== "google_ads";
  if (section === "bio") return campaignType === "lsa";
  if (section === "team") return campaignType !== "google_ads" || hasQuestions;
  return true;
};

const applyCampaignCopy = <T extends WizardStep | ReviewSection>(item: T, campaignType: CampaignType) => {
  const section = "section" in item ? item.section : item.id;
  if (section === "team") return { ...item, ...teamCopy(campaignType) };
  if (campaignType === "both" && section === "budget") {
    return { ...item, title: "LSA Budget & Bidding", description: "Review the LSA budget before the Google Ads questions" };
  }
  if (campaignType === "both" && section === "geo") {
    return { ...item, title: "LSA Geo Target", description: "Confirm LSA locations before the Google Ads questions" };
  }
  return item;
};

export function wizardStepsForCampaign(campaignType: CampaignType, hasQuestions: boolean) {
  return WIZARD_STEPS
    .filter((step) => sectionIsAvailable(step.section, campaignType, hasQuestions))
    .map((step) => applyCampaignCopy(step, campaignType));
}

export function reviewSectionsForCampaign(campaignType: CampaignType, hasQuestions: boolean) {
  return REVIEW_SECTIONS
    .filter((section) => sectionIsAvailable(section.id, campaignType, hasQuestions))
    .map((section) => applyCampaignCopy(section, campaignType));
}
