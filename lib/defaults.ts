import { ClientResponse, PlanningProposal, WeekDay } from "@/types/planning";

const WEEK_DAYS: WeekDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

export function defaultBusinessHours() {
  return WEEK_DAYS.map((day) => ({
    day,
    isClosed: day === "sunday",
    openTime: day === "sunday" ? undefined : "08:00",
    closeTime: day === "sunday" ? undefined : "17:00"
  }));
}

export function createEmptyClientResponse(
  proposal?: PlanningProposal
): ClientResponse {
  const missingInfoResponses = {
    totalFieldworkers: "",
    ...(proposal?.missingInfoChecklist.reduce<Record<string, string | number | boolean | string[]>>(
      (acc, item) => {
        if (item.fieldType === "checkbox") {
          acc[item.id] = false;
        } else if (item.fieldType === "number") {
          acc[item.id] = 0;
        } else if (item.fieldType === "multiselect") {
          acc[item.id] = [];
        } else {
          acc[item.id] = "";
        }
        return acc;
      },
      {}
    ) ?? {})
  };

  return {
    introAcknowledged: false,
    services: {
      decision: "accept",
      comment: ""
    },
    budget: {
      decision: "accept",
      requestedBudgetNote: "",
      comment: ""
    },
    geoTarget: {
      decision: "accept",
      preferredLocations: proposal?.geoTarget.visibleLocations.slice(0, 2) ?? [],
      note: "",
      comment: ""
    },
    assets: {
      logoFileName: "",
      photos: [],
      comment: ""
    },
    businessHours: defaultBusinessHours(),
    hoursNotes: "",
    businessBioSelection: [],
    adsPreviewComment: "",
    missingInfoResponses,
    acknowledgedMissingItems: [],
    finalComment: ""
  };
}
