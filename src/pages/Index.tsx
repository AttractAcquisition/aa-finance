import { useState, useMemo } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { MonthlyTable } from "@/components/MonthlyTable";
import { ProfitChart } from "@/components/ProfitChart";
import {
  MonthlyEntry,
  computeEntry,
  loadEntries,
  saveEntries,
  formatCurrency,
  getMonthLabel,
} from "@/lib/financial-data";

export default function Index() {
  const [rawEntries, setRawEntries] = useState<MonthlyEntry[]>(loadEntries);
  const entries = useMemo(() => rawEntries.map(computeEntry), [rawEntries]);

  const handleUpdate = (updated: MonthlyEntry[]) => {
    setRawEntries(updated);
    saveEntries(updated);
  };

  const totalTrust = entries.reduce((s, e) => s + e.trustSurplus, 0);
  const latest = entries[entries.length - 1];
  const currentMonth = latest ? getMonthLabel(latest.month) : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 lg:px-16 py-8 flex items-start justify-between gap-8">
        <div>
          <p className="label-mono text-primary mb-2">Attract Acquisition</p>
          <h1 className="font-display text-[28px] font-semibold leading-tight text-foreground">
            LLC Financial <span className="text-primary">Model</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1.5 pt-0.5">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-2.5 py-1">
            Monthly Tracking
          </span>
          <span className="font-mono text-[10px] text-white-45 tracking-[0.08em]">
            Updated {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-background border-b border-border px-8 lg:px-16 flex gap-8">
        {["Overview", "Revenue", "Expenses", "Distributions"].map((tab, i) => (
          <button
            key={tab}
            className={`font-mono text-[11px] tracking-[0.1em] uppercase py-4 border-b-2 transition-colors ${
              i === 0
                ? "text-primary border-primary"
                : "text-white-45 border-transparent hover:text-primary hover:border-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main className="max-w-[900px] mx-auto px-8 lg:px-16 py-12 space-y-12">
        {/* Summary section */}
        <section>
          <p className="label-mono text-primary mb-2">Snapshot</p>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Current Period</h2>
          <p className="text-[14px] text-white-45 mb-8 pb-6 border-b border-border">
            Key metrics for the latest recorded month
          </p>
          <SummaryCards entries={entries} />
        </section>

        {/* Cumulative trust callout */}
        <div className="border border-teal-border bg-teal-dim rounded-md px-6 py-5 flex items-center justify-between gap-8">
          <p className="text-[13px] text-white-80 max-w-[560px] leading-relaxed">
            Cumulative trust surplus across all recorded periods. This reserve supports tax obligations, quarterly estimates, and emergency operating capital.
          </p>
          <span className="font-display text-[22px] text-primary whitespace-nowrap">
            {formatCurrency(totalTrust)}
          </span>
        </div>

        {/* Chart */}
        <section>
          <ProfitChart entries={entries} />
        </section>

        {/* Table */}
        <section>
          <MonthlyTable entries={entries} onUpdate={handleUpdate} rawEntries={rawEntries} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-8 lg:px-16 py-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white-45">
          Attract Acquisition · Financial Model
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-primary">
          Confidential
        </span>
      </footer>
    </div>
  );
}
