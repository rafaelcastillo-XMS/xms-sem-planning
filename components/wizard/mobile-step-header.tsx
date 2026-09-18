import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { StepProgressBar } from "@/components/wizard/step-progress-bar";
import { publicAsset } from "@/lib/utils";

interface MobileStepHeaderProps {
  logoUrl?: string;
  companyName: string;
  stepTitle: string;
  stepDescription: string;
  currentStep: number;
  totalSteps: number;
}

// Dark client hero with decorative highlights and high-contrast text.
export function MobileStepHeader({
  logoUrl,
  companyName,
  stepTitle,
  stepDescription,
  currentStep,
  totalSteps
}: MobileStepHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-2">
      {/* Barra superior: branding agencia */}
      <div className="px-4 pt-3 pb-2">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-20">
              <Image
                src={publicAsset("/logo.png")}
                alt="XMS Ai"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              SEM Plan
            </span>
          </div>
          <div className="relative h-6 w-[68px]">
            <Image
              src={publicAsset("/google-partner.png")}
              alt="Google Partner"
              fill
              sizes="68px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Client hero */}
      <div className="mx-4">
        <div className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl shadow-slate-900/20 sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fill
                  sizes="48px"
                  className="bg-white object-contain p-1"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-white">
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                Hi {companyName}! 👋
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Let&apos;s set up your LSA campaign together
              </p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 border border-blue-300/25 bg-blue-400/10 text-[10px] font-medium text-blue-100 hover:bg-blue-400/10"
            >
              Client View
            </Badge>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.6)]" />
              Step {currentStep} of {totalSteps}
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
              {stepTitle}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{stepDescription}</p>
          </div>
        </div>
      </div>

      {/* Progreso, sobre fondo claro */}
      <div className="px-4 pt-3">
        <div className="mx-auto w-full max-w-xl">
          <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </div>
  );
}
