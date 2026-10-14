import { ArrowRight, CheckCircle2, ChevronDown, ClipboardCheck, MapPin, MessageSquare, Sparkles, TrendingUp } from "lucide-react";

import { PlanningProposal } from "@/types/planning";

export function PlanningIntroduction({ proposal }: {
  proposal: PlanningProposal;
}) {
  return (
    <section className="space-y-4" aria-labelledby="planning-welcome-title">
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
            <Sparkles aria-hidden="true" className="h-4 w-4" /> Your campaign starts here
          </span>
          <h2 id="planning-welcome-title" className="text-3xl font-bold leading-tight tracking-tight">Let’s shape your Google ads plan.</h2>
          <p className="text-sm leading-relaxed text-slate-300">Review the Local Services Ads plan prepared by our SEM team, tell us what works for your business, and request any changes before submitting your feedback.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="text-lg font-bold text-slate-950">Three things you’ll do</h3>
        <ol className="mt-5 space-y-5">
          {[
            { icon: MapPin, title: "Review your campaign", description: "Choose your services and locations, and review the recommended budget and Google’s monthly minimum." },
            { icon: MessageSquare, title: "Make it yours", description: "Confirm your business details, preview your ads, and tell us what you’d like to change." },
            { icon: ClipboardCheck, title: "Check and submit", description: "Review your answers in the final step, then send your feedback to the SEM team." }
          ].map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</span>
              <div className="min-w-0">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />{title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Your answers are saved as you continue. You can go back to adjust them before the final submission.</p>
        </div>
      </div>

      {proposal.kpiBlocks.length > 0 && (
        <details className="group rounded-2xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
            <TrendingUp aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600" />
            <span className="flex-1"><span className="block text-sm font-bold text-slate-900">How we’ll measure results</span><span className="mt-1 block text-xs text-slate-500">Explore the metrics in your monthly report</span></span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="space-y-3 px-5 pb-5">
            <p className="text-sm leading-relaxed text-slate-600">{proposal.kpiContext}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {proposal.kpiBlocks.map(kpi => (
                <div key={kpi.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h4 className="text-sm font-bold text-slate-900">{kpi.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{kpi.description}</p>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
      <p className="flex items-center justify-center gap-2 px-2 text-center text-sm font-medium text-slate-600">Ready? Start with the services you want to promote.<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></p>
    </section>
  );
}
