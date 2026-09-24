import { ReviewSection, WizardStep } from "@/types/planning";

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    section: "overview",
    title: "Overview",
    description: "Understand KPIs and workflow"
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
    section: "bio",
    title: "Business Bio",
    description: "Choose up to 6 categories"
  },
  {
    id: 6,
    section: "team",
    title: "Team Information",
    description: "Tell us about your active field team"
  },
  {
    id: 7,
    section: "ads",
    title: "Ads Preview",
    description: "Leave optional ad feedback"
  },
  {
    id: 8,
    section: "recommendations",
    title: "SEM Team Recommendations",
    description: "Notes and recommendations from our SEM team"
  },
  {
    id: 9,
    section: "comments",
    title: "Additional Comments",
    description: "Share anything else before submission"
  },
  {
    id: 10,
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
