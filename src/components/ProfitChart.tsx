import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComputedEntry, getMonthLabel } from "@/lib/financial-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  entries: ComputedEntry[];
}

export function ProfitChart({ entries }: Props) {
  const data = entries.map((e) => ({
    month: getMonthLabel(e.month),
    MRR: e.mrr,
    Costs: e.costs,
    "Net Profit": e.netProfit,
    "Trust Surplus": e.trustSurplus,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Revenue & Profit Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(220, 60%, 20%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 50%, 40%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(160, 50%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
                }
              />
              <Legend />
              <Area type="monotone" dataKey="MRR" stroke="hsl(220, 60%, 20%)" fill="url(#gradMrr)" strokeWidth={2} />
              <Area type="monotone" dataKey="Net Profit" stroke="hsl(160, 50%, 40%)" fill="url(#gradProfit)" strokeWidth={2} />
              <Area type="monotone" dataKey="Trust Surplus" stroke="hsl(220, 60%, 50%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
