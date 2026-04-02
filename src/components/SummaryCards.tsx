import { Card, CardContent } from "@/components/ui/card";
import { ComputedEntry, formatCurrency } from "@/lib/financial-data";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Wallet } from "lucide-react";

interface Props {
  entries: ComputedEntry[];
}

export function SummaryCards({ entries }: Props) {
  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;

  if (!latest) return null;

  const cards = [
    { label: "Monthly Recurring Revenue", value: latest.mrr, prev: prev?.mrr, icon: DollarSign },
    { label: "Net Profit", value: latest.netProfit, prev: prev?.netProfit, icon: latest.netProfit >= 0 ? TrendingUp : TrendingDown },
    { label: "Owner Draw", value: latest.draw, prev: prev?.draw, icon: Wallet },
    { label: "Trust Surplus", value: latest.trustSurplus, prev: prev?.trustSurplus, icon: PiggyBank },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const delta = prev && c.prev != null ? c.value - c.prev : null;
        const isPositive = c.value >= 0;
        return (
          <div
            key={c.label}
            className="bg-card border border-border rounded-md p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono text-primary">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary opacity-50" />
            </div>
            <p className="font-display text-[22px] font-semibold text-foreground">
              {formatCurrency(c.value)}
            </p>
            {delta !== null && (
              <p className={`font-mono text-[11px] mt-1.5 ${delta >= 0 ? "text-profit" : "text-loss"}`}>
                {delta >= 0 ? "+" : ""}
                {formatCurrency(delta)} vs prior month
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
