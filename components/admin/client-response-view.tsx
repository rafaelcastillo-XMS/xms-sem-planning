import type { ReactNode } from "react";
import {
  CheckCircle2,
  MessageSquare,
  MapPin,
  DollarSign,
  Briefcase,
  Users,
  Megaphone,
  Clock3,
  AlertCircle,
  type LucideIcon
} from "lucide-react";
import { ClientStepDecision, PlanningSession } from "@/types/planning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClientResponseViewProps {
  session: PlanningSession;
}

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export function ClientResponseView({ session }: ClientResponseViewProps) {
  const { response, proposal } = session;
  const includesLsa = proposal.campaignType !== "google_ads";
  if (session.status !== "submitted")
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 shrink-0 text-slate-400" />
          This client has not submitted the final planning yet. Results appear here once they do.
        </CardContent>
      </Card>
    );

  const services = response.services.selectedServices ?? proposal.services.selected;
  const needsAttention = [response.services, response.budget, response.geoTarget].filter(
    (step) => step.decision === "request_changes"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Client submission received</h3>
              <p className="text-xs text-emerald-700">
                Submitted on {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
          <p className="text-xs font-semibold text-emerald-900">
            {needsAttention === 0
              ? "Client accepted everything as proposed"
              : `${needsAttention} of 3 sections have requested changes`}
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <SummaryTile label="Services" step={response.services} />
          <SummaryTile label="Budget" step={response.budget} />
          <SummaryTile label="Geo target" step={response.geoTarget} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={Briefcase} title="Services" decision={response.services}>
          <Field label="Services the client will run">
            <TagList items={services} empty="None selected" />
          </Field>
          <Quote text={response.services.comment} label="Client comment" />
        </Section>

        <Section icon={DollarSign} title="Budget" decision={response.budget}>
          <Field label="What we proposed">
            <dl className="grid grid-cols-3 gap-2 text-center">
              <Amount label="Weekly" value={money(proposal.budget.weeklyBudget)} />
              <Amount label="Monthly" value={money(proposal.budget.monthlyBudget)} />
              <Amount label="Google min." value={money(proposal.budget.minimumRequiredBudget)} />
            </dl>
          </Field>
          {response.budget.requestedBudgetNote && (
            <Field label="Budget the client requested">
              <p className="rounded-lg border border-primary/10 bg-primary/5 p-2 text-sm font-bold text-primary">
                {response.budget.requestedBudgetNote}
              </p>
            </Field>
          )}
          <Quote text={response.budget.comment} label="Client comment" />
        </Section>

        <Section icon={MapPin} title="Geo target" decision={response.geoTarget}>
          <Field label="Locations the client chose">
            <TagList items={response.geoTarget.preferredLocations} empty="No locations selected" />
          </Field>
          <Field label="Locations we proposed">
            <TagList items={proposal.geoTarget.visibleLocations} empty="None proposed" muted />
          </Field>
          <Quote text={response.geoTarget.comment} label="Client comment" />
          <Quote text={response.geoTarget.note} label="Additional notes" />
        </Section>

        {includesLsa ? <Section icon={Clock3} title="Business hours">
          <div className="space-y-2">
            {response.businessHours.map((hour) => (
              <div key={hour.day} className="flex justify-between gap-3 text-sm">
                <span className="capitalize text-slate-600">{hour.day}</span>
                <span className="font-semibold text-slate-900">{hour.isClosed ? "Closed" : `${hour.openTime}–${hour.closeTime}`}</span>
              </div>
            ))}
          </div>
          <Quote text={response.hoursNotes} label="Business hours notes" />
        </Section> : null}

        {includesLsa ? <Section icon={Users} title="Business profile & team">
          {proposal.campaignType === "lsa" ? <Field label="Selected bio options">
            <TagList
              items={response.businessBioSelection.map(
                (id) => proposal.businessBioOptions.find((o) => o.id === id)?.label || id
              )}
              empty="None selected"
            />
          </Field> : null}
          <Field label="Total fieldworkers">
            <p className="text-sm font-bold text-primary">
              {String(response.missingInfoResponses.totalFieldworkers || "No response provided")}
            </p>
          </Field>
        </Section> : null}

        {proposal.missingInfoChecklist.length > 0 && (
          <Section icon={Briefcase} title="Additional checklist" className="md:col-span-2">
            <div className="grid gap-3 md:grid-cols-2">
              {proposal.missingInfoChecklist.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3">
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  <p className="text-sm text-slate-800">
                    {String(response.missingInfoResponses[item.id] ?? "") || "No response provided"}
                  </p>
                  {response.acknowledgedMissingItems.includes(item.id) && (
                    <Badge variant="outline" className="h-4 w-fit border-slate-300 py-0 text-[10px] leading-none">
                      Acknowledged
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {response.adsPreviewComment && (
          <Section icon={Megaphone} title="Ads preview feedback" className="md:col-span-2">
            <Quote text={response.adsPreviewComment} label="Client feedback" />
          </Section>
        )}

        {response.finalComment && (
          <Section icon={MessageSquare} title="Final client comment" className="md:col-span-2">
            <p className="rounded-2xl bg-slate-900 p-3 text-sm italic leading-relaxed text-slate-100">
              &quot;{response.finalComment}&quot;
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: ClientStepDecision["decision"] }) {
  const accepted = decision === "accept";
  return (
    <Badge variant={accepted ? "success" : "secondary"} className={cn(!accepted && "bg-amber-100 text-amber-900")}>
      {accepted ? "Accepted as proposed" : "Changes requested"}
    </Badge>
  );
}

function SummaryTile({ label, step }: { label: string; step: ClientStepDecision }) {
  const accepted = step.decision === "accept";
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white/80 px-3 py-2">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className={cn("text-[11px] font-bold uppercase", accepted ? "text-emerald-700" : "text-amber-700")}>
        {accepted ? "Accepted" : "Changes"}
      </span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  decision,
  className,
  children
}: {
  icon: LucideIcon;
  title: string;
  decision?: ClientStepDecision;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("premium-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          {decision && <DecisionBadge decision={decision.decision} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      {children}
    </div>
  );
}

function TagList({ items, empty, muted }: { items: string[]; empty: string; muted?: boolean }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge
          key={item}
          variant="outline"
          className={cn("bg-white font-medium", muted && "text-slate-500")}
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <dt className="text-[10px] font-bold uppercase text-slate-500">{label}</dt>
      <dd className="text-sm font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function Quote({ text, label }: { text?: string; label: string }) {
  if (!text) return null;
  return (
    <Field label={label}>
      <p className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm italic text-slate-700">
        &quot;{text}&quot;
      </p>
    </Field>
  );
}
