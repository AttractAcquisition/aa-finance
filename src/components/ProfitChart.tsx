import { ComputedEntry, getMonthLabel } from "@/lib/financial-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  entries: ComputedEntry[];
}

const TEAL = "#00E5C3";
const TEAL_MID = "#00C9A7";
const TRUST_BLUE = "#6688cc";
const BORDER = "rgba(255,255,255,0.1)";

export function ProfitChart({ entries }: Props) {
  const data = entries.map((e) => ({
    month: getMonthLabel(e.month),
    MRR: e.mrr,
    Costs: e.costs,
    "Net Profit": e.netProfit,
    "Trust Surplus": e.trustSurplus,
  }));

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <p className="label-mono text-primary mb-1">Performance</p>
        <h2 className="font-display text-xl font-semibold text-foreground">Revenue & Profit Trend</h2>
      </div>
      <div className="p-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAL} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAL_MID} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={TEAL_MID} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)", fontFamily: "'DM Mono', monospace" }}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)", fontFamily: "'DM Mono', monospace" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d1f1b",
                  border: "1px solid rgba(0,229,195,0.2)",
                  borderRadius: "4px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  color: "#fff",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
                }
              />
              <Legend
                wrapperStyle={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.08em" }}
              />
              <Area type="monotone" dataKey="MRR" stroke={TEAL} fill="url(#gradMrr)" strokeWidth={2} />
              <Area type="monotone" dataKey="Net Profit" stroke={TEAL_MID} fill="url(#gradProfit)" strokeWidth={2} />
              <Area type="monotone" dataKey="Trust Surplus" stroke={TRUST_BLUE} fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
