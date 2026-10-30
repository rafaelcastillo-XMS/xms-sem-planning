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
    <header className="relative isolate overflow-hidden border-b border-blue-950/30 bg-[#002991] text-white shadow-lg shadow-blue-950/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#00143f] via-[#002991] to-[#064bb8]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 -z-10 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="mx-auto w-full max-w-xl px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-3">
          <div className="min-w-[200px] flex-1">
            <div className="relative h-12 w-full sm:h-14">
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
          <div className="relative h-10 w-24 shrink-0 sm:h-12 sm:w-32">
            <Image
              src={publicAsset("/google-partner-updated.png")}
              alt="Google Partner"
              fill
              sizes="(min-width: 640px) 160px, 112px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-4">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-white/10 shadow-md">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                sizes="44px"
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
            {currentStep !== 1 && <p className="mb-1 text-xs font-semibold text-blue-100 sm:text-sm">Your campaign planning</p>}
            <p className="break-words text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
              Hi, {companyName}!
            </p>
          </div>
        </div>

        {currentStep !== 1 && <div className="mb-3">
          <h2 className="break-words text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
            {stepTitle}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-50/90 sm:text-sm">{stepDescription}</p>
        </div>}

        <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} tone="dark" />
      </div>
    </header>
  );
}
