import { CheckCircle2, MessageSquare, MapPin, DollarSign, FileText, Image as ImageIcon } from "lucide-react";
import { PlanningSession } from "@/types/planning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ClientResponseViewProps {
  session: PlanningSession;
}

export function ClientResponseView({ session }: ClientResponseViewProps) {
  const { response, proposal } = session;
  if (session.status !== "submitted") return <Card><CardContent className="p-6 text-sm text-muted-foreground">This client has not submitted the final planning yet.</CardContent></Card>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-emerald-900">Client Submission Received</h3>
            <p className="text-xs text-emerald-700">Submitted on {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
        <Badge variant="success" className="bg-emerald-200 text-emerald-800 border-none">Completed</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Services & Budget */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Services & Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Services Decision</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={response.services.decision === 'accept' ? 'success' : 'secondary'}>
                  {response.services.decision === 'accept' ? 'Accepted' : 'Changes Requested'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-700">{(response.services.selectedServices ?? proposal.services.selected).join(", ") || "None selected"}</p>
              {response.services.comment && (
                <p className="mt-2 text-sm text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  &quot;{response.services.comment}&quot;
                </p>
              )}
            </div>
            
            <Separator />

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Budget Decision</Label>
              <div className="mt-1">
                <Badge variant={response.budget.decision === 'accept' ? 'success' : 'secondary'}>
                  {response.budget.decision === 'accept' ? 'Accepted' : 'Changes Requested'}
                </Badge>
              </div>
              {response.budget.requestedBudgetNote && (
                <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs font-bold text-primary italic">Requested Budget: {response.budget.requestedBudgetNote}</p>
                </div>
              )}
              {response.budget.comment && (
                <p className="mt-2 text-sm text-slate-600 italic">&quot;{response.budget.comment}&quot;</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geo & Hours */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location & Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Preferred Locations</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {response.geoTarget.preferredLocations.map(loc => (
                  <Badge key={loc} variant="outline" className="bg-white">{loc}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Business Hours Notes</Label>
              <p className="mt-1 text-sm text-slate-700">{response.hoursNotes || "No specific notes provided."}</p>
            </div>
          </CardContent>
        </Card>

        {/* Assets (Logo & Photos) */}
        <Card className="premium-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Uploaded Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Company Logo</Label>
              {response.assets.logoFileName ? (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{response.assets.logoFileName}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Not uploaded</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Work Photos</Label>
              <div className="flex flex-wrap gap-2">
                {response.assets.photos.length > 0 ? (
                  response.assets.photos.map((photo, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <ImageIcon className="h-3 w-3 text-slate-400" />
                      <span className="text-xs">{photo}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No photos uploaded</p>
                )}
              </div>
            </div>
            {response.assets.comment && (
              <div className="md:col-span-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Asset Comments</Label>
                <p className="text-sm italic text-slate-600 mt-1">&quot;{response.assets.comment}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Bio, Team & Comments */}
        <Card className="premium-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Final Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Selected Bio Options</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {response.businessBioSelection.map(id => {
                  const label = proposal.businessBioOptions.find(o => o.id === id)?.label || id;
                  return <Badge key={id} variant="secondary" className="bg-primary/10 text-primary border-none">{label}</Badge>
                })}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Team Information</Label>
              <p className="mt-1 text-sm text-slate-700">
                Fieldworkers:{" "}
                <span className="font-bold text-primary">
                  {String(response.missingInfoResponses.totalFieldworkers || "No response provided")}
                </span>
              </p>
            </div>

            {proposal.missingInfoChecklist.length > 0 ? (
              <>
                <Separator />
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Additional Checklist</Label>
                  <div className="mt-2 space-y-3">
                    {proposal.missingInfoChecklist.map(item => (
                      <div key={item.id} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold">{item.label}</span>
                        <p className="text-sm text-slate-700">{response.missingInfoResponses[item.id] || "No response provided"}</p>
                        {response.acknowledgedMissingItems.includes(item.id) && (
                          <Badge variant="outline" className="w-fit text-[10px] leading-none py-0 h-4 border-slate-300">Acknowledged</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {response.finalComment && (
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Final Client Comment</Label>
                <p className="mt-1 p-3 bg-slate-900 text-slate-100 rounded-2xl text-sm italic leading-relaxed">
                  &quot;{response.finalComment}&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={className}>{children}</span>;
}
