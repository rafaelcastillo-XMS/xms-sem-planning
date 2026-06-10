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
  services: decisionSchema,
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

export const planningBuilderSchema = z.object({
  clientName: z.string().min(2, "Company name is required").max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers or hyphens"),
  logoUrl: z.string().url("Logo URL must be valid").optional().or(z.literal("")),
  selectedServicesText: z.string().min(3, "Add at least one selected service"),
  recommendedServicesText: z.string().optional(),
  weeklyBudget: z.coerce.number().min(1),
  monthlyBudget: z.coerce.number().min(1),
  minimumRequiredBudget: z.coerce.number().min(1),
  budgetNote: z.string().min(5).max(800),
  geoRecommendation: z.string().min(5).max(800),
  locationsText: z.string().min(3),
  recommendationsText: z.string().min(5),
  logoInstructionsText: z.string().min(5).max(500),
  photoInstructionsText: z.string().min(5).max(800),
  businessBioOptionsText: z.string().min(5),
  adsPreviewNote: z.string().min(5)
});

export type PlanningBuilderValues = z.infer<typeof planningBuilderSchema>;
