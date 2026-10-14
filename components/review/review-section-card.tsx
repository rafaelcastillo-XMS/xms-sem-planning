import { ReactNode } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewSectionCardProps {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

export function ReviewSectionCard({ title, onEdit, children }: ReviewSectionCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="mb-4 flex-row items-center justify-between gap-3 space-y-0 bg-slate-100 py-3 text-black">
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
        <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${title}`} title={`Edit ${title}`} className="shrink-0 text-slate-700 hover:bg-slate-200 hover:text-black">
          <Pencil aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 break-words text-sm leading-relaxed text-slate-700">{children}</CardContent>
    </Card>
  );
}
