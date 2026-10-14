import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BudgetConfig } from "@/types/planning";

export function BudgetSummaryCard({ budget }: { budget: BudgetConfig }) {
  return (
    <Card className="premium-card border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold tracking-tight">Recommended Campaign Budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-700">These are the minimum weekly and monthly budgets our SEM team recommends for your campaign.</p>
        <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-2">
          {/* Presupuesto semanal del cliente */}
          <div className="rounded-xl border bg-white px-2 py-3 shadow-sm">
            <p className="text-xs leading-tight text-muted-foreground">SEM recommended weekly minimum</p>
            <p className="text-sm font-semibold">{formatCurrency(budget.weeklyBudget)}</p>
          </div>
          {/* Presupuesto mensual del cliente */}
          <div className="rounded-xl border bg-white px-2 py-3 shadow-sm">
            <p className="text-xs leading-tight text-muted-foreground">SEM recommended monthly minimum</p>
            <p className="text-sm font-semibold">{formatCurrency(budget.monthlyBudget)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <p className="text-sm font-bold">Google’s required monthly minimum</p>
          <p className="mt-1 text-lg font-bold">{formatCurrency(budget.minimumRequiredBudget)} / month</p>
          <p className="mt-2 text-sm">This is the monthly minimum identified by our SEM team for your industry. Any different budget you request must still meet this minimum. Our team will review your request before making changes.</p>
        </div>
      </CardContent>
    </Card>
  );
}
