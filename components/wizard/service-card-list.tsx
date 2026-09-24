import { SelectionTile } from "@/components/wizard/selection-tile";

interface ServiceCardListProps {
  selected: string[];
  recommended: string[];
  chosen: string[];
  onToggle: (service: string) => void;
}

export function ServiceCardList({ selected, recommended, chosen, onToggle }: ServiceCardListProps) {
  const groups = [
    { title: "Your plan", options: [...new Set(selected)] },
    { title: "Also recommended", options: [...new Set(recommended)].filter(item => !selected.includes(item)) }
  ];
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-600">Choose what you want to promote. Tap an option to select or remove it.</p>
      {groups.filter(group => group.options.length > 0).map(group => (
        <fieldset key={group.title}>
          <legend className="mb-3 text-sm font-bold text-slate-900">{group.title}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.options.map(service => <SelectionTile key={service} label={service} selected={chosen.includes(service)} onToggle={() => onToggle(service)} />)}
          </div>
        </fieldset>
      ))}
      <p role="status" className="text-sm font-medium text-primary">{chosen.length} selected</p>
    </div>
  );
}
