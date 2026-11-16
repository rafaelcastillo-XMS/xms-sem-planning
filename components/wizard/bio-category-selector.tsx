import { useId, useState } from "react";
import { Check, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BusinessBioOption } from "@/types/planning";

interface BioCategorySelectorProps {
  options: BusinessBioOption[];
  selected: string[];
  onChange: (value: string[]) => void;
  max?: number;
}

export function BioCategorySelector({ options, selected, onChange, max = 6 }: BioCategorySelectorProps) {
  const inputId = useId();
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");
  const availableOptions = [
    ...options,
    ...selected.filter(value => !options.some(option => option.id === value))
      .map(value => ({ id: value, label: value }))
  ];

  const addCategory = () => {
    const label = customCategory.trim();
    if (!label || selected.length >= max) return;
    const existing = availableOptions.find(option =>
      option.label.toLowerCase() === label.toLowerCase() || option.id.toLowerCase() === label.toLowerCase()
    );
    const value = existing?.id ?? label;
    if (selected.includes(value)) {
      setError("This highlight is already selected.");
      return;
    }
    onChange([...selected, value]);
    setCustomCategory("");
    setError("");
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
      return;
    }
    if (selected.length < max) onChange([...selected, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Choose 1–{max} business highlights</p>
        <Badge variant={selected.length === max ? "success" : "secondary"}>{selected.length}/{max}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {availableOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          const disabled = !isSelected && selected.length >= max;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "grid min-h-14 w-full grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
              )}
            >
              <span aria-hidden="true" className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2", isSelected ? "border-primary bg-primary text-white" : "border-slate-300 bg-white")}>
                {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 break-words">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Label htmlFor={inputId}>Add a business highlight</Label>
        <p id={`${inputId}-hint`} className="text-xs text-slate-600">Type a highlight and press + or Enter. At least one is required.</p>
        <div className="flex gap-2">
          <Input
            id={inputId}
            value={customCategory}
            onChange={event => { setCustomCategory(event.target.value); setError(""); }}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                addCategory();
              }
            }}
            placeholder="e.g., Bilingual team"
            aria-describedby={`${inputId}-hint ${inputId}-status`}
            aria-invalid={!!error}
            disabled={selected.length >= max}
            className="bg-white"
          />
          <Button type="button" size="icon" onClick={addCategory} disabled={!customCategory.trim() || selected.length >= max} aria-label="Add highlight" className="shrink-0">
            <Plus aria-hidden="true" className="h-5 w-5 shrink-0" />
          </Button>
        </div>
        <p id={`${inputId}-status`} role="status" className="text-xs text-slate-700">
          {selected.length >= max ? `You have selected ${max} highlights. Deselect one to add another.` : error}
        </p>
      </div>
    </div>
  );
}
