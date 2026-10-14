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

export function BioCategorySelector({
  options,
  selected,
  onChange,
  max = 6
}: BioCategorySelectorProps) {
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
      setError("This category is already selected.");
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

    if (selected.length >= max) return;
    onChange([...selected, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Choose 1–{max} categories</p>
        <Badge variant={selected.length === max ? "success" : "secondary"}>
          {selected.length}/{max}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {availableOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          const disabled = !isSelected && selected.length >= max;

          return (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              onClick={() => toggle(option.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "h-auto min-h-11 justify-start rounded-xl px-3 py-2 text-left text-sm",
                isSelected && "border-primary bg-primary/10 text-primary"
              )}
            >
              {isSelected ? <Check className="mr-2 h-4 w-4" /> : <span className="mr-6" />}
              {option.label}
            </Button>
          );
        })}
      </div>
      <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Label htmlFor={inputId}>Add your own category</Label>
        <p id={`${inputId}-hint`} className="text-xs text-slate-600">
          Missing an option? Type a category and press + or Enter to select it. You do not need to fill all {max} slots.
        </p>
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
          <Button type="button" size="icon" onClick={addCategory} disabled={!customCategory.trim() || selected.length >= max} aria-label="Add category" className="shrink-0">
            <Plus aria-hidden="true" className="h-5 w-5 shrink-0" />
          </Button>
        </div>
        <p id={`${inputId}-status`} role="status" className="text-xs text-slate-700">
          {selected.length >= max ? `You have selected ${max} categories. Deselect one to add another.` : error}
        </p>
      </div>
    </div>
  );
}
