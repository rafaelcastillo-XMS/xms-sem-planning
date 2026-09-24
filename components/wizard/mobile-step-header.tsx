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
    <header className="relative isolate overflow-hidden border-b border-slate-700 bg-slate-950 text-white shadow-xl shadow-slate-950/15">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="mx-auto w-full max-w-xl px-4 pb-6 pt-5 sm:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="min-w-[200px] flex-1">
            <div className="relative h-24 w-full sm:h-28">
              <Image
                src={publicAsset("/xms-logo-dark.webp")}
                alt="XMS Ai"
                fill
                sizes="(min-width: 640px) 372px, (max-width: 355px) calc(100vw - 32px), calc(100vw - 156px)"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="relative h-14 w-28 shrink-0 sm:h-16 sm:w-40">
            <Image
              src={publicAsset("/google-partner-updated.png")}
              alt="Google Partner"
              fill
              sizes="(min-width: 640px) 160px, 112px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 py-6">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-white/20 bg-white/10 shadow-lg">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                sizes="56px"
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
            <p className="mb-2 text-sm font-semibold text-blue-200 sm:text-base">Your campaign planning</p>
            <p className="break-words text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Hi, {companyName}!
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
