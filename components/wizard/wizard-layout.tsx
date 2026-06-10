import { ReactNode } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { publicAsset } from "@/lib/utils";

interface WizardLayoutProps {
  header: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
  backLabel?: string;
  nextLabel?: string;
  hideActions?: boolean;
}

// Ajustes #10 + #11
// - Footer con logos XMS y Google Partner (branding consistente en cada paso)
// - Botón "Continue" con gradiente más amigable
export function WizardLayout({
  header,
  children,
  onBack,
  onNext,
  disableNext,
  backLabel = "Back",
  nextLabel = "Continue",
  hideActions
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen">
      {header}
      <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-4 pb-36">
        {children}
        {/* Footer de branding (visible al final del contenido) */}
        <div className="pt-6 pb-2 flex items-center justify-center gap-4 opacity-80">
          <div className="relative h-7 w-24">
            <Image
              src={publicAsset("/logo.png")}
              alt="XMS Ai"
              fill
              sizes="96px"
              className="object-contain"
            />
          </div>
          <span className="text-slate-300">·</span>
          <div className="relative h-7 w-24">
            <Image
              src={publicAsset("/google-partner.png")}
              alt="Google Partner"
              fill
              sizes="96px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
      {!hideActions ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-white/95 p-4 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="flex-1"
              onClick={onBack}
              disabled={!onBack}
            >
              {backLabel}
            </Button>
            <Button
              type="button"
              size="default"
              className="flex-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:opacity-90 text-white border-0 shadow-md"
              onClick={onNext}
              disabled={disableNext}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      ) : null}

    </div>
  );
}
