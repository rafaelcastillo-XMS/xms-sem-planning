import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  tone?: "light" | "dark";
}

export function StepProgressBar({
  currentStep,
  totalSteps,
  tone = "light"
}: StepProgressBarProps) {
  const value = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-2">
      <div className={cn("flex items-center justify-between text-xs font-medium", tone === "dark" ? "text-slate-200" : "text-muted-foreground")}>
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{value}% complete</span>
      </div>
      <Progress
        value={value}
        aria-label="Planning progress"
        className={tone === "dark" ? "bg-white/15 [&>div]:bg-blue-400" : undefined}
      />
    </div>
  );
}
