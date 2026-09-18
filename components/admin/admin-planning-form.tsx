"use client";

import { useState } from "react";
import { readLogo } from "@/lib/logo-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, Save, X, Check, Info, Briefcase, DollarSign, MapPin, ClipboardCheck, Zap, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { GeneratedPublicUrlCard } from "@/components/admin/generated-public-url-card";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  planningBuilderSchema,
  type PlanningBuilderValues
} from "@/lib/validators";

interface AdminPlanningFormProps {
  defaultValues: PlanningBuilderValues;
  onSubmit: (values: PlanningBuilderValues) => void | Promise<void>;
  submitLabel?: string;
  publicPath?: string;
  onPreview?: () => void;
  onCancel?: () => void;
  isSlugLocked?: boolean;
  isSuccess?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
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

  return (
    <form onSubmit={handleSubmit(async (values) => {
      setSaveError("");
      try { await onSubmit(values); } catch { setSaveError("Could not save to Supabase. Please try again. Your changes are still here."); }
    })} className="grid gap-6 pb-20 md:grid-cols-[1fr_340px]">
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
        <Card className="premium-card">
          <CardHeader className="pb-3 border-b border-slate-100/50 mb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              <Info className="h-4 w-4 text-primary" />
              1. Basic Client Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="clientName" className="text-xs font-semibold uppercase text-slate-500">Company name</Label>
              <Input id="clientName" {...register("clientName")} className="bg-white/50" />
              <FieldError message={formState.errors.clientName?.message} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="slug" className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-3 w-3" />
                  Public slug
                </span>
                {isSlugLocked && (
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-muted-foreground">
                    Locked (link already shared)
                  </span>
                )}
              </Label>
              <Input
                id="slug"
                {...register("slug")}
                disabled={isSlugLocked}
                className={isSlugLocked ? "bg-slate-50 cursor-not-allowed opacity-70" : "bg-white/50"}
              />
              <FieldError message={formState.errors.slug?.message} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="logoFile" className="text-xs font-semibold uppercase text-slate-500">Company logo</Label>
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
                <img src={form.watch("logoUrl")} alt="Company logo preview" className="h-20 w-20 rounded-lg border object-contain" />
                <Button type="button" variant="outline" disabled={readingLogo || formState.isSubmitting} onClick={() => { form.setValue("logoUrl", "", { shouldDirty: true, shouldValidate: true }); }}>Remove logo</Button>
              </div>}
              <FieldError message={formState.errors.logoUrl?.message} />
            </div>

          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3 border-b border-slate-100/50 mb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              <Briefcase className="h-4 w-4 text-primary" />
              2. Services
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Selected services</Label>
              <Textarea
                {...register("selectedServicesText")}
                placeholder="One service per line"
                className="bg-white/50 min-h-[120px]"
              />
              <FieldError message={formState.errors.selectedServicesText?.message} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Recommended services</Label>
              <Textarea
                {...register("recommendedServicesText")}
                placeholder="One service per line"
                className="bg-white/50 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3 border-b border-slate-100/50 mb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              <DollarSign className="h-4 w-4 text-primary" />
              3. Budget & Bidding
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Client weekly budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" {...register("weeklyBudget")} className="pl-7 bg-white/50" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Client monthly budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" {...register("monthlyBudget")} className="pl-7 bg-white/50" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Min. req. budget from Google</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" {...register("minimumRequiredBudget")} className="pl-7 bg-white/50" />
                </div>
              </div>
            </div>
            <div className="grid gap-2 mt-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Budget Recommendation note by XMS</Label>
              <Textarea {...register("budgetNote")} className="bg-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3 border-b border-slate-100/50 mb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              <MapPin className="h-4 w-4 text-primary" />
              4. Geo Target
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Visible target locations (selected by client)</Label>
              <Textarea
                {...register("locationsText")}
                placeholder="One location per line"
                className="bg-white/50 min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Geo target recommendation by XMS</Label>
              <Textarea {...register("geoRecommendation")} className="bg-white/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3 border-b border-slate-100/50 mb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              5. Creative Details & SEM Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Company logo description</Label>
              <Textarea {...register("logoInstructionsText")} className="bg-white/50" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Business &amp; work photos description</Label>
              <Textarea {...register("photoInstructionsText")} className="bg-white/50" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Business bio options</Label>
              <Textarea
                {...register("businessBioOptionsText")}
                placeholder="One option per line"
                className="bg-white/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Ads preview note</Label>
              <Textarea {...register("adsPreviewNote")} className="bg-white/50" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Recommendations</Label>
              <Textarea
                {...register("recommendationsText")}
                placeholder="One recommendation per line"
                className="bg-white/50"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6 md:sticky md:top-6 md:h-fit animate-in fade-in slide-in-from-right-4 duration-700 delay-100 fill-mode-both">
        {publicPath ? (
          <div className="p-0.5 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-[calc(var(--radius)+2px)]">
            <GeneratedPublicUrlCard publicPath={publicPath} />
          </div>
        ) : null}

        <Card className="premium-card border-primary/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-400" />
          <CardHeader className="pb-2">
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
              disabled={formState.isSubmitting || readingLogo}
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

            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
            <div className="pt-2">
              <p className="text-[10px] text-center text-muted-foreground leading-tight px-2">
                Changes and the attached logo are saved to Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
