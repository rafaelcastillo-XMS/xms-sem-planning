import Image from "next/image";

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

export function MobileStepHeader({
  logoUrl,
  companyName,
  stepTitle,
  stepDescription,
  currentStep,
  totalSteps
}: MobileStepHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-slate-700 bg-slate-950 text-white shadow-xl shadow-slate-950/15 sm:sticky sm:top-0 sm:z-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="mx-auto w-full max-w-xl px-4 pb-5 pt-3 sm:pt-4">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-8 w-24 shrink-0 rounded-lg bg-white">
              <Image
                src={publicAsset("/logo.png")}
                alt="XMS Ai"
                fill
                sizes="96px"
                className="object-contain px-2 py-1"
                priority
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
              SEM Plan
            </span>
          </div>
          <div className="relative h-8 w-20 shrink-0 rounded-lg bg-white">
            <Image
              src={publicAsset("/google-partner.png")}
              alt="Google Partner"
              fill
              sizes="80px"
              className="object-contain px-2 py-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                sizes="48px"
                unoptimized
                className="bg-white object-contain p-1"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-white">
                {companyName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">Your campaign planning</p>
            <p className="break-words text-sm font-semibold leading-snug text-white sm:text-base">
              Hi {companyName}! 👋
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="break-words text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            {stepTitle}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">{stepDescription}</p>
        </div>

        <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} tone="dark" />
      </div>
    </header>
  );
}
