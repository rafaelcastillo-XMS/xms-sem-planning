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

// Header inspirado en apps móviles: bloque azul sólido de marca,
// redondeado, flotando sobre fondo claro (no fondo azul en toda la pantalla).
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

      {/* Hero: bloque sólido azul de marca */}
      <div className="mx-4">
        <div className="mx-auto w-full max-w-xl rounded-3xl bg-primary p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 shadow-sm">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fill
                  sizes="48px"
                  className="object-cover"
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
              <p className="truncate text-xs text-white/70">
                Let&apos;s set up your LSA campaign together
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-white/15 text-white border border-white/30"
            >
              Client View
            </Badge>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight text-white">
              {stepTitle}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">{stepDescription}</p>
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
