import { useId } from "react";
import { Info } from "lucide-react";
import { SelectionTile } from "@/components/wizard/selection-tile";

interface GeoTargetSelectorProps {
  locations: string[];
  selected: string[];
  onToggle: (location: string) => void;
}

export function GeoTargetSelector({ locations, selected, onToggle }: GeoTargetSelectorProps) {
  const hintId = useId();
  const options = [...new Set(locations)];
  const selectedCount = options.filter(location => selected.includes(location)).length;

  return (
    <div className="space-y-3">
      <p id={hintId} className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        Select all locations you want to target. You can choose multiple locations. Click a selected location again to remove it.
      </p>
      <p role="status" className="text-xs font-semibold text-slate-600">
        {selectedCount} of {options.length} locations selected
      </p>
      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Target locations" aria-describedby={hintId}>
        {options.map(location => (
          <SelectionTile key={location} label={location} selected={selected.includes(location)} onToggle={() => onToggle(location)} />
        ))}
      </div>
      {options.length === 0 && (
        <p className="text-sm text-slate-600">No locations have been added to this plan yet. Request changes below to tell the SEM team which areas to include.</p>
      )}
    </div>
  );
}
