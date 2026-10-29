import { z } from "zod";

const weekDayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

const decisionSchema = z.object({
  decision: z.enum(["accept", "request_changes"]),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional()
});

export const businessHourSchema = z
  .object({
    day: weekDayEnum,
    isClosed: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional()
  })
  .superRefine((hour, ctx) => {
    if (hour.isClosed) return;

    if (!hour.openTime || !hour.closeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["openTime"],
        message: "Open days require both opening and closing time"
      });
      return;
    }

    if (hour.openTime >= hour.closeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closeTime"],
        message: "Closing time must be later than opening time"
      });
    }
  });

export const clientResponseSchema = z.object({
  introAcknowledged: z.boolean(),
  services: decisionSchema.extend({ selectedServices: z.array(z.string()).optional() }),
  budget: decisionSchema.extend({
    requestedBudgetNote: z
      .string()
      .max(500, "Requested budget note cannot exceed 500 characters")
      .optional()
  }),
  geoTarget: decisionSchema.extend({
    preferredLocations: z.array(z.string()),
    note: z.string().max(500, "Geo note cannot exceed 500 characters").optional()
  }),
  assets: z.object({
    logoFileName: z.string().optional(),
    photos: z.array(z.string()),
    comment: z.string().max(500, "Asset comment cannot exceed 500 characters").optional()
  }),
  businessHours: z.array(businessHourSchema),
  hoursNotes: z.string().max(500, "Hours note cannot exceed 500 characters").optional(),
  businessBioSelection: z
    .array(z.string())
    .max(6, "You can choose up to 6 categories"),
  adsPreviewComment: z
    .string()
    .max(500, "Ads preview comment cannot exceed 500 characters")
    .optional(),
  missingInfoResponses: z.record(
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  ),
  acknowledgedMissingItems: z.array(z.string()),
  finalComment: z.string().max(500, "Final comment cannot exceed 500 characters").optional()
});

export type ClientResponseFormValues = z.infer<typeof clientResponseSchema>;

const customQuestionSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(2, "Enter the question"),
  description: z.string().trim().max(300).default(""),
  required: z.boolean().default(false),
  fieldType: z.enum(["text", "textarea", "number", "select", "checkbox"]),
  optionsText: z.string().trim().default("")
}).superRefine((question, ctx) => {
  if (question.fieldType === "select" && !question.optionsText.split(/\n|,/).some((option) => option.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["optionsText"],
      message: "Add at least one option"
    });
  }
});

export const planningBuilderSchema = z.object({
  campaignType: z.enum(["lsa", "google_ads", "both"], {
    required_error: "Choose LSA, Google Ads, or both"
  }),
  clientName: z.string().min(2, "Company name is required").max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers or hyphens"),
  logoUrl: z.string().url("Logo URL must be valid").optional().or(z.literal("")),
  selectedServicesText: z.string().min(3, "Add at least one selected service"),
  recommendedServicesText: z.string().optional(),
  weeklyBudget: z.coerce.number().min(1, "Enter a weekly budget of at least $1"),
  monthlyBudget: z.coerce.number().min(1, "Enter a monthly budget of at least $1"),
  minimumRequiredBudget: z.coerce.number().min(1, "Enter Google’s monthly minimum (at least $1)"),
  budgetNote: z.string().trim().max(800).default(""),
  geoRecommendation: z.string().trim().max(800).default(""),
  locationsText: z.string().min(3, "Add at least one target location (3 or more characters)"),
  recommendationsText: z.string().trim().default(""),
  photoInstructionsText: z.string().trim().max(800).default(""),
  businessBioOptionsText: z.string().default(""),
  adsPreviewNote: z.string().trim().default(""),
  customQuestions: z.array(customQuestionSchema).default([])
}).superRefine((values, ctx) => {
  if (values.campaignType === "lsa" && values.businessBioOptionsText.trim().length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["businessBioOptionsText"],
      message: "Add a business bio option (5 or more characters)"
    });
  }
});

export type PlanningBuilderValues = z.infer<typeof planningBuilderSchema>;
