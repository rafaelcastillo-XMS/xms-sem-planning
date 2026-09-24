"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  TriangleAlert,
  User,
  Users,
  DollarSign,
  MapPin,
  Type,
  Megaphone,
  Lightbulb,
  Flag,
  Sparkles,
  ClipboardCheck,
  MessageSquare
} from "lucide-react";
import { useForm } from "react-hook-form";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { AdsPreviewCard } from "@/components/wizard/ads-preview-card";
import { BioCategorySelector } from "@/components/wizard/bio-category-selector";
import { BudgetSummaryCard } from "@/components/wizard/budget-summary-card";
import { CompactStepCard } from "@/components/wizard/compact-step-card";
import { DecisionCardGroup } from "@/components/wizard/decision-card-group";
import { GeoTargetSelector } from "@/components/wizard/geo-target-selector";
import { MobileStepHeader } from "@/components/wizard/mobile-step-header";
import { ServiceCardList } from "@/components/wizard/service-card-list";
import { WizardLayout } from "@/components/wizard/wizard-layout";
import { ReviewSectionCard } from "@/components/review/review-section-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { REVIEW_SECTIONS, WIZARD_STEPS } from "@/lib/wizard-config";
import {
  clientResponseSchema,
  ClientResponseFormValues
} from "@/lib/validators";
import { Client, PlanningSession, ProposalSection } from "@/types/planning";

interface ClientWizardProps {
  client: Client;
  session: PlanningSession;
  onSaveDraft: (values: ClientResponseFormValues) => void | Promise<void>;
  onSubmitFinal: (values: ClientResponseFormValues) => void | Promise<void>;
}

const SECTION_TO_STEP = Object.fromEntries(
  WIZARD_STEPS.map(step => [step.section, step.id])
) as Record<ProposalSection, number>;

const TOTAL_STEPS = WIZARD_STEPS.length;

export function ClientWizard({
  client,
  session,
  onSaveDraft,
  onSubmitFinal
}: ClientWizardProps) {
  const { width, height } = useWindowSize();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [closeRequested, setCloseRequested] = useState(false);
  const [submitted, setSubmitted] = useState(session.status === "submitted");

  const form = useForm<ClientResponseFormValues>({
    resolver: zodResolver(clientResponseSchema),
    defaultValues: session.response,
    mode: "onSubmit"
  });

  const {
    watch,
    setValue,
    trigger,
    getValues,
    register,
    reset
  } = form;

  useEffect(() => {
    reset(session.response);
    setSubmitted(session.status === "submitted");
  }, [session, reset]);

  const values = watch();

  const currentStepMeta = WIZARD_STEPS[currentStep - 1];
  const validateStep = async () => {
    setStepError(null);

    if (currentStep === 1) {
      setValue("introAcknowledged", true, { shouldDirty: true });
      return true;
    }

    if (currentStep === 2) {
      const selected = getValues("services.selectedServices") ?? session.proposal.services.selected;
      if (!selected.length) {
        setStepError("Please select at least one service to promote.");
        return false;
      }
      setValue("services.selectedServices", selected);
      return trigger(["services.decision", "services.selectedServices"]);
    }

    if (currentStep === 3) {
      return trigger(["budget.decision", "budget.requestedBudgetNote", "budget.comment"]);
    }

    if (currentStep === 4) {
      return trigger([
        "geoTarget.decision",
        "geoTarget.preferredLocations",
        "geoTarget.note",
        "geoTarget.comment"
      ]);
    }

    if (currentStep === 5) {
      const ok = await trigger(["businessBioSelection"]);
      if (!ok) return false;
      if (getValues("businessBioSelection").length === 0) {
        setStepError("Please choose at least one category.");
        return false;
      }
      return true;
    }

    if (currentStep === 6) {
      const value = Number(getValues("missingInfoResponses.totalFieldworkers") ?? 0);
      if (!value || Number.isNaN(value) || value < 1) {
        setStepError("Please enter the total number of fieldworkers (1 or more).");
        return false;
      }
      return true;
    }

    if (currentStep === 7) {
      return trigger(["adsPreviewComment"]);
    }

    if (currentStep === 8) {
      return true;
    }

    if (currentStep === 9) {
      return trigger(["finalComment"]);
    }

    return true;
  };

  const handleBack = () => {
    setStepError(null);
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (!valid) return;

    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    try {
      const snapshot = getValues();
      if (currentStep === TOTAL_STEPS) {
        if (!await trigger([
          "introAcknowledged", "services", "budget", "geoTarget",
          "businessBioSelection", "missingInfoResponses", "adsPreviewComment", "finalComment"
        ])) {
          setStepError("Please review your answers and correct the highlighted fields before submitting.");
          return;
        }
        await onSubmitFinal(snapshot);
        setSubmitted(true);
      } else {
        await onSaveDraft(snapshot);
        setCurrentStep((step) => Math.min(TOTAL_STEPS, step + 1));
      }
    } catch {
      setStepError("Could not save your answers. Please try again before continuing.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8 animate-in fade-in zoom-in-95 duration-700">
        <Confetti
          width={width}
          height={height}
          numberOfPieces={150}
          recycle={false}
          colors={['#10b981', '#3b82f6', '#06b6d4', '#8b5cf6']}
        />
        <Card className="premium-card w-full overflow-hidden border-none relative z-10 shadow-2xl">
          <div className="h-2.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
          <CardContent className="space-y-6 p-8 text-center">
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 line-tight">Submission Complete!</h2>
              <p className="text-base text-slate-500 leading-relaxed px-4">
                Thank you for your feedback. Your planning review for <span className="font-bold text-slate-900 border-b-2 border-emerald-200">{client.name}</span> has been successfully submitted.
              </p>
            </div>
            
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
              <p className="text-xs text-slate-600 font-medium italic text-center">
                &quot;Our team will review your responses and reach out shortly to finalize the LSA launch details.&quot;
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="button"
                className="h-12 w-full bg-slate-900 text-base font-bold hover:bg-slate-800"
                onClick={() => { window.close(); setCloseRequested(true); }}
              >
                That&apos;s all
              </Button>
              {closeRequested && (
                <p role="status" className="text-xs text-slate-500">
                  Your planning is saved. If this tab stays open, you can close it manually.
                </p>
              )}
              <Button
                type="button"
                variant="link"
                className="self-center text-sm font-medium text-slate-500 hover:text-slate-900"
                onClick={() => { setCurrentStep(1); setSubmitted(false); setCloseRequested(false); }}
              >
                Review planning again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <WizardLayout
      header={
        <MobileStepHeader
          logoUrl={client.logoUrl}
          companyName={client.name}
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          stepTitle={currentStepMeta.title}
          stepDescription={currentStepMeta.description}
        />
      }
      onBack={currentStep > 1 && !isSaving ? handleBack : undefined}
      onNext={handleNext}
      disableNext={isSaving}
      nextLabel={isSaving ? "Saving…" : currentStep === TOTAL_STEPS ? "Submit and Process" : "Continue"}
    >
      {stepError ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-2 p-3 text-sm text-amber-900 font-medium">
            <TriangleAlert className="h-4 w-4 text-amber-600 shrink-0" />
            {stepError}
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 1 ? (
        <CompactStepCard
          title="Welcome to your LSA planning review"
          description="This workflow replaces email back-and-forth so we can finalize your setup faster."
        >
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-slate-700 underline decoration-primary/30 underline-offset-4 tracking-tight">Introduction</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">{session.proposal.kpiContext}</p>
          <div className="grid gap-3 pt-2">
            {session.proposal.kpiBlocks.map((kpi) => (
              <div key={kpi.id} className="rounded-xl border bg-white p-4 shadow-sm border-slate-100 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary group-hover:animate-pulse" />
                  <p className="text-sm font-bold text-slate-800">{kpi.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{kpi.description}</p>
              </div>
            ))}
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 2 ? (
        <Card className="shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <ServiceCardList
              selected={session.proposal.services.selected}
              recommended={session.proposal.services.recommended}
              chosen={values.services.selectedServices ?? session.proposal.services.selected}
              onToggle={(service) => {
                const selected = values.services.selectedServices ?? session.proposal.services.selected;
                const next = selected.includes(service) ? selected.filter(item => item !== service) : [...selected, service];
                setValue("services.selectedServices", next, { shouldDirty: true });
                const proposed = session.proposal.services.selected;
                setValue("services.decision", next.length === proposed.length && proposed.every(item => next.includes(item)) ? "accept" : "request_changes", { shouldDirty: true });
                setStepError(null);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 3 ? (
        <CompactStepCard title="Budget & Bidding" description="Confirm plan and request adjustments if needed.">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Campaign Investment</span>
          </div>
          <BudgetSummaryCard budget={session.proposal.budget} />
          <div className="pt-4 space-y-6">
            <DecisionCardGroup
              decision={values.budget.decision}
              onDecisionChange={(value) =>
                setValue("budget.decision", value, { shouldDirty: true, shouldValidate: true })
              }
              comment={values.budget.comment}
              onCommentChange={(value) =>
                setValue("budget.comment", value, { shouldDirty: true, shouldValidate: true })
              }
            />
            <div className="grid gap-2 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Requested budget note (optional)</Label>
              <Textarea
                placeholder="Ex: I want to start with a lower budget for the first 2 weeks..."
                value={values.budget.requestedBudgetNote || ""}
                onChange={(event) =>
                  setValue("budget.requestedBudgetNote", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
                className="bg-white"
              />
            </div>
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 4 ? (
        <CompactStepCard title="Geo Target" description="Confirm and adjust preferred target areas.">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Location Strategy</span>
          </div>
          <div className="space-y-4">
            {/* Ajuste #2 — Bloque superior: Target seleccionado por el cliente */}
            <div className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Target (Selected by client)
              </p>
              <GeoTargetSelector
                locations={session.proposal.geoTarget.visibleLocations}
                selected={values.geoTarget.preferredLocations}
                onToggle={(location) => {
                  const selected = values.geoTarget.preferredLocations;
                  const next = selected.includes(location)
                    ? selected.filter((item) => item !== location)
                    : [...selected, location];
                  setValue("geoTarget.preferredLocations", next, {
                    shouldDirty: true,
                    shouldValidate: true
                  });
                }}
              />
            </div>
            {/* Ajuste #2 — Bloque inferior: recomendación de XMS */}
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-slate-700 leading-relaxed">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> Geo target recommendation by XMS
              </p>
              <p>{session.proposal.geoTarget.recommendation}</p>
            </div>
            <DecisionCardGroup
              decision={values.geoTarget.decision}
              onDecisionChange={(value) =>
                setValue("geoTarget.decision", value, { shouldDirty: true, shouldValidate: true })
              }
              comment={values.geoTarget.comment}
              onCommentChange={(value) =>
                setValue("geoTarget.comment", value, { shouldDirty: true, shouldValidate: true })
              }
            />
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 5 ? (
        <CompactStepCard title="Business Bio" description="Choose at least one category that best fits your business.">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Market Positioning</span>
          </div>
          <BioCategorySelector
            options={session.proposal.businessBioOptions}
            selected={values.businessBioSelection}
            onChange={(value) =>
              setValue("businessBioSelection", value, {
                shouldDirty: true,
                shouldValidate: true
              })
            }
          />
        </CompactStepCard>
      ) : null}

      {currentStep === 6 ? (
        <CompactStepCard
          title="Team Information"
          description="Tell us about your active field service team."
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Field Team</span>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0 fill-primary/15" />
              <div className="flex-1">
                <Label
                  htmlFor="fieldworkers"
                  className="text-sm font-bold text-slate-900"
                >
                  Total number of fieldworkers
                  <span className="text-destructive"> *</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  How many team members are active in field service.
                </p>
              </div>
            </div>
            <input
              id="fieldworkers"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Ex: 8"
              value={String(
                values.missingInfoResponses?.totalFieldworkers ?? ""
              )}
              onChange={(event) =>
                setValue(
                  "missingInfoResponses",
                  {
                    ...(values.missingInfoResponses || {}),
                    totalFieldworkers: Number(event.target.value) || 0
                  },
                  { shouldDirty: true, shouldValidate: true }
                )
              }
              className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 7 ? (
        <CompactStepCard title="Ads Preview" description="Preview of how your business will appear in Google LSA.">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Visual Identity</span>
          </div>
          {/* Ajuste #6 — Ad preview con formato real de Google LSA.
              Datos derivados de la sesión + selección del cliente. */}
          <AdsPreviewCard
            note={session.proposal.adsPreviewNote}
            businessName={client.name}
            service={(values.services.selectedServices ?? session.proposal.services.selected)[0]}
            location={
              values.geoTarget.preferredLocations[0] ||
              session.proposal.geoTarget.visibleLocations[0]
            }
            phoneNumber={client.contactPhone || "(555) 555-0100"}
            bioDescription={
              session.proposal.businessBioOptions.find(
                (option) => option.id === values.businessBioSelection[0]
              )?.label
            }
          />
          <div className="grid gap-2 mt-6">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Feedback or changes</Label>
            <Textarea
              placeholder="I'd like to change the tagline to..."
              value={values.adsPreviewComment || ""}
              onChange={(event) =>
                setValue("adsPreviewComment", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              className="bg-white"
            />
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 8 ? (
        <CompactStepCard title="SEM Team Recommendations" description="Review the recommendations from our SEM team.">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">SEM Team Notes</span>
          </div>
          {/* Ajuste #7 — Solo recomendaciones del SEM team. Se removieron MissingInfoForm y final comment
              porque la información ya se solicita en pasos anteriores (eliminada repetición). */}
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-secondary bg-secondary/20 p-4">
              <p className="text-sm font-bold text-slate-800">SEM Team Recommendations</p>
              <ul className="space-y-2">
                {session.proposal.recommendations.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-slate-700 leading-relaxed">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 9 ? (
        <CompactStepCard
          title="Additional Comments"
          description="Share any final context before the SEM team processes your plan."
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Final Notes</span>
          </div>
          <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-50 p-4">
            <Label className="text-sm font-bold text-slate-900">
              Is there anything else you want us to know before we process your SEM plan?
            </Label>
            <p className="mt-1 text-xs text-slate-600">
              Add special requests, launch timing notes, contact preferences, or anything that did not fit earlier.
            </p>
            <Textarea
              placeholder="Ex: Please call before launching, or prioritize these locations first..."
              value={values.finalComment || ""}
              onChange={(event) =>
                setValue("finalComment", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              className="mt-4 min-h-32 bg-white"
            />
          </div>
        </CompactStepCard>
      ) : null}

      {currentStep === 10 ? (
        <CompactStepCard title="Review & Submit" description="Verify all sections before finalizing.">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Final Step</span>
          </div>
          <div className="space-y-4">
            {REVIEW_SECTIONS.map((section) => (
              <ReviewSectionCard
                key={section.id}
                title={section.title}
                onEdit={() => setCurrentStep(SECTION_TO_STEP[section.id])}
              >
                <div className="text-xs space-y-1">
                  {section.id === "services" && (
                    <p className="font-medium text-slate-700">Selected: <span className="text-primary font-bold">{(values.services.selectedServices ?? session.proposal.services.selected).join(", ") || "None"}</span></p>
                  )}
                  {section.id === "budget" && (
                    <p className="font-medium text-slate-700">Decision: <span className="text-primary font-bold">{values.budget.decision}</span></p>
                  )}
                  {section.id === "geo" && (
                    <p className="font-medium text-slate-700">Decision: <span className="text-primary font-bold">{values.geoTarget.decision}</span></p>
                  )}
                  {section.id === "bio" && (
                    <p className="font-medium text-slate-700">Selection: <span className="text-primary font-bold">{values.businessBioSelection.length} categories</span></p>
                  )}
                  {section.id === "team" && (
                    <p className="font-medium text-slate-700">Fieldworkers: <span className="text-primary font-bold">{String(values.missingInfoResponses?.totalFieldworkers ?? "—")}</span></p>
                  )}
                  {section.id === "ads" && (
                    <p className="font-medium text-slate-700">Feedback: <span className="text-primary font-bold">{values.adsPreviewComment ? "Provided" : "None"}</span></p>
                  )}
                  {section.id === "recommendations" && (
                    <p className="font-medium text-slate-700">Status: <span className="text-primary font-bold">Checked</span></p>
                  )}
                  {section.id === "comments" && (
                    <p className="font-medium text-slate-700">Additional comments: <span className="text-primary font-bold">{values.finalComment ? "Provided" : "None"}</span></p>
                  )}
                </div>
              </ReviewSectionCard>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 tracking-tight">Ready to launch</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                By clicking &quot;Submit and Process&quot;, you authorize Xperience Ai to proceed with these campaign settings. 
                You can still request changes via chat or email after submission.
              </p>
            </div>
          </div>
        </CompactStepCard>
      ) : null}

      <input type="hidden" {...register("introAcknowledged")} />
    </WizardLayout>
  );
}
