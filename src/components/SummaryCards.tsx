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
    {
      label: "MRR",
      value: latest.mrr,
      prev: prev?.mrr,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Net Profit",
      value: latest.netProfit,
      prev: prev?.netProfit,
      icon: latest.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: latest.netProfit >= 0 ? "text-profit" : "text-loss",
    },
    {
      label: "Owner Draw",
      value: latest.draw,
      prev: prev?.draw,
      icon: Wallet,
      color: "text-draw",
    },
    {
      label: "Trust Surplus",
      value: latest.trustSurplus,
      prev: prev?.trustSurplus,
      icon: PiggyBank,
      color: "text-trust",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const delta = prev && c.prev != null ? c.value - c.prev : null;
        return (
          <Card key={c.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </span>
                <c.icon className={`h-4 w-4 ${c.color} opacity-70`} />
              </div>
              <p className={`text-2xl font-semibold font-mono ${c.color}`}>
                {formatCurrency(c.value)}
              </p>
              {delta !== null && (
                <p className={`text-xs mt-1 ${delta >= 0 ? "text-profit" : "text-loss"}`}>
                  {delta >= 0 ? "+" : ""}
                  {formatCurrency(delta)} vs prev
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
