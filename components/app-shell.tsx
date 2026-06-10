import { ReactNode } from "react";

import { cn, publicAsset } from "@/lib/utils";

interface AppShellProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({
  title,
  subtitle,
  rightSlot,
  children,
  className
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 transition-all duration-500 animate-in fade-in zoom-in-95 duration-700", className)}>
        <header className="glass mb-8 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl relative overflow-hidden group">
          {/* Decorative subtle background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
          
          <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
              {/* Logo - Larger and crisp */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicAsset("/logo.png")}
                alt="XMS Logo"
                className="h-20 md:h-24 w-auto object-contain transition-transform hover:scale-105 duration-500"
              />
              
              <div className="space-y-3">
                {title ? (
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-[1.1]">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <p className="max-w-2xl text-base md:text-lg text-slate-500 font-medium leading-relaxed opacity-90">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Actions Section - Top Right on Desktop */}
            {rightSlot ? (
              <div className="flex shrink-0 items-center justify-center md:justify-end gap-3 pt-2 md:pt-0">
                {rightSlot}
              </div>
            ) : null}
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
          {children}
        </div>
      </main>

      <footer className="w-full border-t border-slate-200/50 bg-white/30 backdrop-blur-sm py-8 text-center">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} SEM Planning · All rights reserved.
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Made with professional care by{" "}
            <a 
              href="https://xperienceaimarketing.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline transition-all"
            >
              Xperience Ai Marketing Solutions
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
