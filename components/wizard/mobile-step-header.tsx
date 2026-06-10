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

// Ajustes #10 + #11
// - Header más friendly y con más color (gradiente XMS)
// - Logos XMS y Google Partner visibles en la cabecera
// - Layout más cálido sin perder jerarquía
export function MobileStepHeader({
  logoUrl,
  companyName,
  stepTitle,
  stepDescription,
  currentStep,
  totalSteps
}: MobileStepHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-white/30 backdrop-blur-md">
      {/* Banda superior con gradiente colorido */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2.5 text-white shadow-md">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Logo XMS — branding agencia */}
            <div className="relative h-6 w-20 rounded bg-white/95 px-1.5 py-0.5">
              <Image
                src={publicAsset("/logo.png")}
                alt="XMS Ai"
                fill
                sizes="80px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
              SEM Plan
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Logo Google Partner */}
            <div className="relative h-6 w-[68px] rounded bg-white/95">
              <Image
                src={publicAsset("/google-partner.png")}
                alt="Google Partner"
                fill
                sizes="68px"
                className="object-contain p-0.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo del header con info del cliente y progreso */}
      <div className="bg-white/95 px-4 py-3">
        <div className="mx-auto w-full max-w-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-primary/20 bg-secondary shadow-sm">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15 text-xs font-bold text-primary">
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">
                Hi {companyName}! 👋
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Let&apos;s set up your LSA campaign together
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              Client View
            </Badge>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-50 via-indigo-50 to-fuchsia-50 border border-indigo-100/60 p-3">
            <h2 className="text-base font-bold leading-tight text-slate-900">
              {stepTitle}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">{stepDescription}</p>
          </div>
          <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </div>
  );
}
