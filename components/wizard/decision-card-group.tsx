import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DecisionCardGroupProps {
  decision: "accept" | "request_changes";
  onDecisionChange: (value: "accept" | "request_changes") => void;
  comment?: string;
  onCommentChange: (value: string) => void;
  helperText?: string;
  requestLabel?: string;
  commentPlaceholder?: string;
}

export function DecisionCardGroup({
  decision,
  onDecisionChange,
  comment,
  onCommentChange,
  helperText,
  requestLabel = "Request changes",
  commentPlaceholder = "Add your comments"
}: DecisionCardGroupProps) {
  return (
    <div className="space-y-3">
      <RadioGroup
        value={decision}
        onValueChange={(value) => onDecisionChange(value as "accept" | "request_changes")}
        className="grid gap-2"
      >
        <Card className={cn(
          "flex items-center gap-3 p-4 transition-colors",
          decision === "accept" && "border-primary bg-primary/5"
        )}>
          <RadioGroupItem value="accept" id="accept" />
          <Label htmlFor="accept" className="cursor-pointer flex-1 py-1">
            Accept as proposed
          </Label>
        </Card>

        <Card className={cn(
          "flex items-center gap-3 p-4 transition-colors",
          decision === "request_changes" && "border-primary bg-primary/5"
        )}>
          <RadioGroupItem value="request_changes" id="request_changes" />
          <Label htmlFor="request_changes" className="cursor-pointer flex-1 py-1">
            {requestLabel}
          </Label>
        </Card>
      </RadioGroup>


      {decision === "request_changes" && <Textarea
        value={comment ?? ""}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder={commentPlaceholder}
        aria-label={commentPlaceholder}
      />}
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
