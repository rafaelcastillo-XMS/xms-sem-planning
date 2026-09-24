import { SelectionTile } from "@/components/wizard/selection-tile";

interface GeoTargetSelectorProps {
  locations: string[];
  selected: string[];
  onToggle: (location: string) => void;
}

export function GeoTargetSelector({ locations, selected, onToggle }: GeoTargetSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Target locations">
      {[...new Set(locations)].map(location => (
        <SelectionTile key={location} label={location} selected={selected.includes(location)} onToggle={() => onToggle(location)} />
      ))}
    </div>
  );
}
