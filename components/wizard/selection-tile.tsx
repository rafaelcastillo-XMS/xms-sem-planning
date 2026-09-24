import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectionTile({ label, selected, onToggle }: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-slate-950 shadow-sm hover:bg-primary/15"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-white hover:text-slate-800"
      )}
    >
      <span aria-hidden="true" className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", selected ? "border-primary bg-primary text-white" : "border-slate-300 bg-white")}>
        {selected && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </button>
  );
}
