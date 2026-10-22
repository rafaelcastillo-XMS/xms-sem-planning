import { MissingInfoItem, MissingInfoResponseValue } from "@/types/planning";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MissingInfoFormProps {
  items: MissingInfoItem[];
  values: Record<string, MissingInfoResponseValue>;
  onValueChange: (id: string, value: MissingInfoResponseValue) => void;
}

export function MissingInfoForm({
  items,
  values,
  onValueChange
}: MissingInfoFormProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        return (
          <div key={item.id} className="space-y-2 rounded-xl border bg-white p-3">
            <div className="flex items-start gap-2">
              <Label htmlFor={`value-${item.id}`} className="leading-snug">
                {item.label}
                {item.required ? <span className="text-destructive"> *</span> : null}
              </Label>
            </div>

            {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}

            {item.fieldType === "number" ? (
              <Input
                id={`value-${item.id}`}
                type="number"
                value={String(values[item.id] ?? "")}
                onChange={(event) => onValueChange(item.id, Number(event.target.value))}
                placeholder="Enter number"
              />
            ) : null}

            {item.fieldType === "text" ? (
              <Input
                id={`value-${item.id}`}
                value={String(values[item.id] ?? "")}
                onChange={(event) => onValueChange(item.id, event.target.value)}
                placeholder="Add answer"
              />
            ) : null}

            {item.fieldType === "textarea" ? (
              <Textarea
                id={`value-${item.id}`}
                value={String(values[item.id] ?? "")}
                onChange={(event) => onValueChange(item.id, event.target.value)}
                placeholder="Add details"
              />
            ) : null}

            {item.fieldType === "select" ? (
              <select
                id={`value-${item.id}`}
                value={String(values[item.id] ?? "")}
                onChange={(event) => onValueChange(item.id, event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select an option</option>
                {item.options?.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : null}

            {item.fieldType === "checkbox" ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-2">
                <Checkbox
                  id={`value-${item.id}`}
                  checked={Boolean(values[item.id])}
                  onCheckedChange={(checked) => onValueChange(item.id, Boolean(checked))}
                />
                <Label htmlFor={`value-${item.id}`} className="text-xs text-muted-foreground">
                  Mark as provided
                </Label>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
