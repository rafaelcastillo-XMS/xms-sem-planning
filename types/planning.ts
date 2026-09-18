export type PlanningStatus = "draft" | "in_review" | "submitted";

export type ProposalSection =
  | "overview"
  | "services"
  | "budget"
  | "geo"
  | "assets"
  | "hours"
  | "bio"
  | "team"
  | "ads"
  | "recommendations"
  | "comments"
  | "review";

export interface Client {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  // Ajuste #6 — Teléfono mostrado en el Ad Preview tipo Google LSA
  contactPhone?: string;
}

export interface KpiBlock {
  id: string;
  title: string;
  description: string;
}

export interface ServiceSelection {
  selected: string[];
  recommended: string[];
}

export interface BudgetConfig {
  weeklyBudget: number;
  monthlyBudget: number;
  minimumRequiredBudget: number;
  recommendationNote: string;
}

export interface GeoTargetConfig {
  recommendation: string;
  visibleLocations: string[];
}

export interface AssetRequirement {
  id: string;
  title: string;
  instructions: string;
  acceptedFileTypes: string[];
  maxSizeMb: number;
  minResolution?: string;
  required: boolean;
}

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface BusinessHour {
  day: WeekDay;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface BusinessBioOption {
  id: string;
  label: string;
}

export type MissingFieldType = "text" | "number" | "checkbox" | "multiselect";

export interface MissingInfoItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  fieldType: MissingFieldType;
  options?: string[];
}

export interface PlanningProposal {
  title: string;
  subtitle: string;
  kpiContext: string;
  kpiBlocks: KpiBlock[];
  services: ServiceSelection;
  budget: BudgetConfig;
  geoTarget: GeoTargetConfig;
  assetRequirements: AssetRequirement[];
  businessBioOptions: BusinessBioOption[];
  adsPreviewNote: string;
  recommendations: string[];
  missingInfoChecklist: MissingInfoItem[];
}

export interface ClientStepDecision {
  decision: "accept" | "request_changes";
  comment?: string;
}

export interface AssetsUploadState {
  logoFileName?: string;
  photos: string[];
  comment?: string;
}

export type MissingInfoResponseValue = string | number | boolean | string[];

export interface ClientResponse {
  introAcknowledged: boolean;
  services: ClientStepDecision;
  budget: ClientStepDecision & {
    requestedBudgetNote?: string;
  };
  geoTarget: ClientStepDecision & {
    preferredLocations: string[];
    note?: string;
  };
  assets: AssetsUploadState;
  businessHours: BusinessHour[];
  hoursNotes?: string;
  businessBioSelection: string[];
  adsPreviewComment?: string;
  missingInfoResponses: Record<string, MissingInfoResponseValue>;
  acknowledgedMissingItems: string[];
  finalComment?: string;
}

export interface ReviewSection {
  id: ProposalSection;
  title: string;
  description: string;
}

export interface WizardStep {
  id: number;
  section: ProposalSection;
  title: string;
  description: string;
}

export interface PlanningSession {
  id: string;
  clientId: string;
  status: PlanningStatus;
  proposal: PlanningProposal;
  response: ClientResponse;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface PlanningSeedState {
  clients: Client[];
  sessions: PlanningSession[];
}

export interface NewPlanningInput {
  proposal?: PlanningProposal;
  clientName: string;
  slug: string;
  logoUrl?: string;
}
