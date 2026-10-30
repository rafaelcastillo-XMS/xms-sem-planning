"use client";

import { useState } from "react";
import { readLogo } from "@/lib/logo-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, type DefaultValues } from "react-hook-form";
import { Eye, Save, X, Check, Info, Briefcase, DollarSign, MapPin, ClipboardCheck, Zap, Link as LinkIcon, Plus, Trash2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

import { GeneratedPublicUrlCard } from "@/components/admin/generated-public-url-card";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  planningBuilderSchema,
  type PlanningBuilderValues
} from "@/lib/validators";
import {
  campaignTemplateLabel,
  campaignQuestionTemplates,
  isCampaignTemplateQuestion,
  questionsForCampaignType
} from "@/lib/question-templates";

interface AdminPlanningFormProps {
  defaultValues: DefaultValues<PlanningBuilderValues>;
  onSubmit: (values: PlanningBuilderValues) => void | Promise<void>;
  submitLabel?: string;
  publicPath?: string;
  onPreview?: () => void;
  onCancel?: () => void;
  isSlugLocked?: boolean;
  isSuccess?: boolean;
}

function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return <p id={id} className="text-xs text-destructive">{message}</p>;
}

export function AdminPlanningForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save Planning",
  publicPath,
  onPreview,
  onCancel,
  isSlugLocked = false,
  isSuccess = false
}: AdminPlanningFormProps) {
  const [readingLogo, setReadingLogo] = useState(false);
  const [saveError, setSaveError] = useState("");
  const form = useForm<PlanningBuilderValues>({
    resolver: zodResolver(planningBuilderSchema),
    defaultValues,
    mode: "onSubmit"
  });

  const { register, handleSubmit, formState } = form;
  const { fields: customQuestions, append: appendQuestion, remove: removeQuestion, replace: replaceQuestions } = useFieldArray({
    control: form.control,
    name: "customQuestions"
  });
  const campaignType = form.watch("campaignType");
  const includesLsa = campaignType === "lsa" || campaignType === "both";
  const includesBusinessBio = campaignType === "lsa";
  const presetQuestionCount = campaignType ? campaignQuestionTemplates(campaignType).length : 0;

  return (
    <form onSubmit={handleSubmit(async (values) => {
      setSaveError("");
      try { await onSubmit(values); } catch { setSaveError("Could not save to Supabase. Please try again. Your changes are still here."); }
    })} className="grid gap-6 pb-20 md:grid-cols-[1fr_340px]">
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
        <Card className="premium-card overflow-hidden border-primary/20">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <Megaphone className="h-4 w-4 shrink-0 text-white" />
              Choose the advertising plan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-slate-600">What does this client need? Your selection determines the default planning questions.</p>
            <RadioGroup
              value={campaignType}
              onValueChange={(value) => {
                const nextCampaignType = value as PlanningBuilderValues["campaignType"];
                const previousCampaignType = form.getValues("campaignType");
                form.setValue("campaignType", nextCampaignType, { shouldDirty: true, shouldValidate: true });
                if (previousCampaignType !== nextCampaignType) {
                  replaceQuestions(questionsForCampaignType(nextCampaignType, form.getValues("customQuestions")));
                }
              }}
              className="grid gap-3 sm:grid-cols-3"
            >
              {[
                ["lsa", "LSA", "Local Services Ads"],
                ["google_ads", "Google Ads", "Search campaign planning"],
                ["both", "Both", "LSA + Google Ads"]
              ].map(([value, title, description]) => (
                <Label key={value} htmlFor={`campaign-${value}`} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors", campaignType === value ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300")}>
                  <RadioGroupItem id={`campaign-${value}`} value={value} className="mt-0.5" />
                  <span><span className="block text-sm font-bold text-slate-900">{title}</span><span className="mt-1 block text-xs font-normal text-slate-500">{description}</span></span>
                </Label>
              ))}
            </RadioGroup>
            <FieldError message={formState.errors.campaignType?.message} />
            {campaignType ? (
              <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900">
                {campaignType === "lsa"
                  ? `${presetQuestionCount} LSA question was loaded automatically, together with the existing services, budget, geo target, business bio, team, and ad preview flow.`
                  : campaignType === "google_ads"
                    ? `${presetQuestionCount} Google Ads questions were loaded automatically. You can review or edit them below.`
                    : `${presetQuestionCount} Google Ads, LSA, and combined-plan questions were loaded without repeating shared sections.`}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {campaignType ? <>
        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <Info className="h-4 w-4 shrink-0 text-white" />
              1. Basic Client Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="clientName" className="text-xs font-semibold uppercase text-slate-500">Company name (required)</Label>
              <Input id="clientName" aria-describedby="clientName-error" aria-invalid={!!formState.errors.clientName} aria-required="true" {...register("clientName")} placeholder="e.g., Company name" className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
              <FieldError id="clientName-error" message={formState.errors.clientName?.message} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="slug" className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-3 w-3" />
                  Public slug (required)
                </span>
                {isSlugLocked && (
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-muted-foreground">
                    Locked (link already shared)
                  </span>
                )}
              </Label>
              <Input
                id="slug"
                placeholder="e.g., company-name"
                aria-describedby="slug-error" aria-invalid={!!formState.errors.slug} aria-required="true" {...register("slug")}
                disabled={isSlugLocked}
                className={isSlugLocked ? "bg-slate-50 placeholder:text-slate-400 cursor-not-allowed opacity-70" : "bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive"}
              />
              <FieldError id="slug-error" message={formState.errors.slug?.message} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="logoFile" className="text-xs font-semibold uppercase text-slate-500">Company logo (optional)</Label>
              <Input id="logoFile" type="file" accept="image/png,image/jpeg,image/webp" disabled={readingLogo || formState.isSubmitting} onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setReadingLogo(true);
                form.clearErrors("logoUrl");
                try { form.setValue("logoUrl", await readLogo(file), { shouldDirty: true, shouldValidate: true }); }
                catch (error) { form.setError("logoUrl", { message: error instanceof Error ? error.message : "Could not read image." }); }
                finally { setReadingLogo(false); }
              }} />
              <p className="text-xs text-muted-foreground">PNG, JPEG or WebP, up to 5 MB. Saved with this planning when you save.</p>
              {readingLogo && <p role="status" className="text-xs">Preparing image…</p>}
              {form.watch("logoUrl") && <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.watch("logoUrl")} alt="Company logo preview" className="h-20 w-20 rounded-xl border object-contain" />
                <Button type="button" variant="outline" disabled={readingLogo || formState.isSubmitting} onClick={() => { form.setValue("logoUrl", "", { shouldDirty: true, shouldValidate: true }); }}>Remove logo</Button>
              </div>}
              <FieldError message={formState.errors.logoUrl?.message} />
            </div>

          </CardContent>
        </Card>

        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <Briefcase className="h-4 w-4 shrink-0 text-white" />
              2. Services
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="selectedServicesText" className="text-xs font-semibold uppercase text-slate-500">Selected services (required)</Label>
              <p id="selectedServicesText-hint" className="flex w-fit items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
                One service per line. Press Enter to add another.
              </p>
              <Textarea
                id="selectedServicesText"
                aria-describedby="selectedServicesText-hint selectedServicesText-error"
                aria-invalid={!!formState.errors.selectedServicesText} aria-required="true" {...register("selectedServicesText")}
                placeholder={"Service 1\nService 2"}
                className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive min-h-[120px]"
              />
              <FieldError id="selectedServicesText-error" message={formState.errors.selectedServicesText?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recommendedServicesText" className="text-xs font-semibold uppercase text-slate-500">Recommended services (optional)</Label>
              <p id="recommendedServicesText-hint" className="flex w-fit items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
                One service per line. Press Enter to add another.
              </p>
              <Textarea
                id="recommendedServicesText"
                aria-describedby="recommendedServicesText-hint recommendedServicesText-error"
                aria-invalid={!!formState.errors.recommendedServicesText} {...register("recommendedServicesText")}
                placeholder={"Recommended service 1\nRecommended service 2"}
                className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive min-h-[100px]"
              />
              <FieldError id="recommendedServicesText-error" message={formState.errors.recommendedServicesText?.message} />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <DollarSign className="h-4 w-4 shrink-0 text-white" />
              3. {campaignType === "both" ? "LSA Budget & Bidding" : "Budget & Bidding"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weeklyBudget" className="text-xs font-semibold uppercase text-slate-500">SEM recommended weekly minimum (required)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" placeholder="000.00" id="weeklyBudget" aria-describedby="weeklyBudget-error" aria-invalid={!!formState.errors.weeklyBudget} aria-required="true" {...register("weeklyBudget")} className="pl-7 bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
                </div>
                <FieldError id="weeklyBudget-error" message={formState.errors.weeklyBudget?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlyBudget" className="text-xs font-semibold uppercase text-slate-500">SEM recommended monthly minimum (required)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" placeholder="000.00" id="monthlyBudget" aria-describedby="monthlyBudget-error" aria-invalid={!!formState.errors.monthlyBudget} aria-required="true" {...register("monthlyBudget")} className="pl-7 bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
                </div>
                <FieldError id="monthlyBudget-error" message={formState.errors.monthlyBudget?.message} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minimumRequiredBudget" className="text-xs font-semibold uppercase text-slate-500">Google required monthly minimum (required)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input id="minimumRequiredBudget" aria-describedby="google-minimum-hint minimumRequiredBudget-error" type="number" step="0.01" placeholder="000.00" aria-invalid={!!formState.errors.minimumRequiredBudget} aria-required="true" {...register("minimumRequiredBudget")} className="pl-7 bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
                </div>
                <FieldError id="minimumRequiredBudget-error" message={formState.errors.minimumRequiredBudget?.message} />
                <p id="google-minimum-hint" className="text-xs text-slate-600">Enter Google’s current monthly minimum for this client’s industry. This amount is entered manually by SEM.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <MapPin className="h-4 w-4 shrink-0 text-white" />
              4. {campaignType === "both" ? "LSA Geo Target" : "Geo Target"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="locationsText" className="text-xs font-semibold uppercase text-slate-500">Visible target locations (selected by client) (required)</Label>
              <p id="locationsText-hint" className="flex w-fit items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
                One location per line. Press Enter to add another.
              </p>
              <Textarea
                id="locationsText"
                aria-describedby="locationsText-hint locationsText-error"
                aria-invalid={!!formState.errors.locationsText} aria-required="true" {...register("locationsText")}
                placeholder={"Fort Pierce, FL 34950\nPort St. Lucie, FL 34952"}
                className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive min-h-[100px]"
              />
              <FieldError id="locationsText-error" message={formState.errors.locationsText?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="geoRecommendation" className="text-xs font-semibold uppercase text-slate-500">Geo target recommendation by XMS (optional)</Label>
              <p id="geoRecommendation-hint" className="text-xs leading-relaxed text-slate-600">Add the locations XMS recommends based on our research, in addition to those requested by the client. This field is optional.</p>
              <Textarea id="geoRecommendation" aria-describedby="geoRecommendation-hint geoRecommendation-error" aria-invalid={!!formState.errors.geoRecommendation} {...register("geoRecommendation")} placeholder={"Fort Pierce, FL 34950\nVero Beach, FL 32960"} className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
              <FieldError id="geoRecommendation-error" message={formState.errors.geoRecommendation?.message} />
            </div>
          </CardContent>
        </Card>

        {includesLsa ? <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <ClipboardCheck className="h-4 w-4 shrink-0 text-white" />
              5. Creative Details & SEM Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {includesBusinessBio ? <div className="grid gap-2">
              <Label htmlFor="businessBioOptionsText" className="text-xs font-semibold uppercase text-slate-500">Business bio options (required)</Label>
              <p id="businessBioOptionsText-hint" className="flex w-fit items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
                One verified business attribute per line. Press Enter to add another.
              </p>
              <Textarea
                id="businessBioOptionsText"
                aria-describedby="businessBioOptionsText-hint businessBioOptionsText-error"
                aria-invalid={!!formState.errors.businessBioOptionsText} aria-required="true" {...register("businessBioOptionsText")}
                placeholder={"e.g., Locally owned\ne.g., Free estimates"}
                className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive"
              />
              <FieldError id="businessBioOptionsText-error" message={formState.errors.businessBioOptionsText?.message} />
            </div> : null}
            {includesLsa ? <div className="grid gap-2">
              <Label htmlFor="adsPreviewNote" className="text-xs font-semibold uppercase text-slate-500">Ads preview note (optional)</Label>
              <Textarea id="adsPreviewNote" aria-describedby="adsPreviewNote-error" aria-invalid={!!formState.errors.adsPreviewNote} {...register("adsPreviewNote")} placeholder="Describe what the client should review in the ads and any details that may vary." className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
              <FieldError id="adsPreviewNote-error" message={formState.errors.adsPreviewNote?.message} />
            </div> : null}
          </CardContent>
        </Card> : null}

        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <ClipboardCheck className="h-4 w-4 shrink-0 text-white" />
              SEM Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor="recommendationsText" className="text-xs font-semibold uppercase text-slate-500">Recommendations (optional)</Label>
            <p id="recommendationsText-hint" className="flex w-fit items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              <Info aria-hidden="true" className="h-4 w-4 shrink-0" />
              One recommendation per line. Press Enter to add another.
            </p>
            <Textarea id="recommendationsText" aria-describedby="recommendationsText-hint recommendationsText-error" aria-invalid={!!formState.errors.recommendationsText} {...register("recommendationsText")} placeholder={"e.g., Request reviews after completed jobs\ne.g., Keep business hours up to date"} className="bg-white/50 placeholder:text-slate-400 aria-invalid:border-destructive" />
            <FieldError id="recommendationsText-error" message={formState.errors.recommendationsText?.message} />
          </CardContent>
        </Card>

        <Card className="premium-card overflow-hidden">
          <CardHeader className="mb-5 bg-black py-4 text-white">
            <CardTitle className="flex items-center gap-2 text-base font-bold leading-snug text-white">
              <Plus className="h-4 w-4 shrink-0 text-white" />
              Preset and custom client questions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-slate-600">Campaign questions load automatically from the selected plan. You can edit them or add client-specific questions.</p>
            {customQuestions.map((question, index) => {
              const fieldType = form.watch(`customQuestions.${index}.fieldType`);
              return (
                <div key={question.id} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Question {index + 1}</p>
                      {isCampaignTemplateQuestion(question.id) ? <p className="mt-0.5 text-xs font-medium text-blue-700">{campaignTemplateLabel(question.id)}</p> : null}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)} className="text-slate-500 hover:text-destructive">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`custom-question-${index}`}>Question</Label>
                    <Input id={`custom-question-${index}`} {...register(`customQuestions.${index}.label`)} placeholder="e.g., What is your preferred launch date?" />
                    <FieldError message={formState.errors.customQuestions?.[index]?.label?.message} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`custom-type-${index}`}>Answer type</Label>
                      <select id={`custom-type-${index}`} {...register(`customQuestions.${index}.fieldType`)} className="h-10 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="text">Short text</option>
                        <option value="textarea">Long text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                    <Label className="flex items-center gap-2 self-end rounded-md border bg-white px-3 py-2.5 text-sm font-medium">
                      <input type="checkbox" {...register(`customQuestions.${index}.required`)} className="h-4 w-4 accent-primary" />
                      Required answer
                    </Label>
                  </div>
                  {fieldType === "select" ? (
                    <div className="grid gap-2">
                      <Label htmlFor={`custom-options-${index}`}>Options</Label>
                      <Textarea id={`custom-options-${index}`} {...register(`customQuestions.${index}.optionsText`)} placeholder={"Option 1\nOption 2"} className="min-h-20 bg-white" />
                      <p className="text-xs text-slate-500">One option per line.</p>
                      <FieldError message={formState.errors.customQuestions?.[index]?.optionsText?.message} />
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendQuestion({ id: `question-${Date.now()}`, label: "", description: "", required: false, fieldType: "text", optionsText: "" })}>
              <Plus className="mr-2 h-4 w-4" /> Add a new question
            </Button>
          </CardContent>
        </Card>
        </> : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Choose LSA, Google Ads, or both to load the planning questions.
          </div>
        )}
      </div>

      <aside className="space-y-6 md:sticky md:top-6 md:h-fit animate-in fade-in slide-in-from-right-4 duration-700 delay-100 fill-mode-both">
        {publicPath ? (
          <div className="p-0.5 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-[calc(var(--radius)+2px)]">
            <GeneratedPublicUrlCard publicPath={publicPath} />
          </div>
        ) : null}

        <Card className="premium-card border-primary/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-400" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Zap className="h-4 w-4 text-primary fill-primary/10" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              type="submit" 
              className={cn(
                "w-full transition-all active:scale-[0.98] font-bold",
                isSuccess ? "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-200" : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
              disabled={formState.isSubmitting || readingLogo || !campaignType}
            >
              {isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              {formState.isSubmitting ? "Saving…" : isSuccess ? "Changes saved" : submitLabel}
            </Button>
            {onPreview ? (
              <Button type="button" variant="outline" className="w-full bg-white transition-all active:scale-[0.98] font-medium border-slate-200" onClick={onPreview}>
                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                Preview Flow
              </Button>
            ) : null}
            {onCancel ? (
              <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-destructive font-medium" onClick={onCancel}>
                <X className="mr-2 h-4 w-4 text-slate-400" />
                Cancel & Return
              </Button>
            ) : null}

            {Object.keys(formState.errors).length > 0 && (
          <p role="alert" className="mt-3 text-sm text-destructive">Please correct the highlighted fields before saving. Your entries are still here.</p>
        )}
            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
            <div className="pt-2">
              <p className="text-[10px] text-center text-muted-foreground leading-tight px-2">
                Changes and the attached logo are saved to Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
      <div className="border-b border-slate-200 pb-5 md:col-span-2">
        <Button
          type="submit"
          className={cn(
            "w-full font-bold sm:w-auto sm:min-w-60",
            isSuccess ? "bg-emerald-600 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
          )}
          disabled={formState.isSubmitting || readingLogo || !campaignType}
        >
          {isSuccess ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {formState.isSubmitting ? "Saving…" : isSuccess ? "Changes saved" : submitLabel}
        </Button>
        {Object.keys(formState.errors).length > 0 && (
          <p role="alert" className="mt-3 text-sm text-destructive">Please correct the highlighted fields before saving. Your entries are still here.</p>
        )}
        {saveError && <p className="mt-3 text-sm text-destructive">{saveError}</p>}
      </div>
    </form>
  );
}
