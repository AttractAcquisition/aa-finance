import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SummaryCards } from "@/components/SummaryCards";
import { MonthlyTable } from "@/components/MonthlyTable";
import { ProfitChart } from "@/components/ProfitChart";
import { formatCurrency } from "@/lib/financial-data";
import { useTrackingModel } from "@/hooks/useTrackingModel";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const TABS = [
  { label: "Overview", path: "/" },
  { label: "Quarterly Review", path: "/quarterly-review" },
];

export default function Index() {
  const { entries, rawEntries, isLoading, upsertEntry, deleteEntry } = useTrackingModel();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const totalTrust = entries.reduce((s, e) => s + e.trustSurplus, 0);
  const cumulativeTrust = entries.reduce((s, e) => s + e.trustSurplus, 0);

  const handleUpdate = async (updated: import("@/lib/financial-data").MonthlyEntry[]) => {
    // Detect additions / edits by upserting changed rows
    const existing = new Map(rawEntries.map((e) => [e.id, e]));
    for (const entry of updated) {
      const prev = existing.get(entry.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(entry)) {
        await upsertEntry(entry);
      }
    }
    // Detect deletions
    const updatedIds = new Set(updated.map((e) => e.id));
    for (const e of rawEntries) {
      if (!updatedIds.has(e.id)) await deleteEntry(e.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 lg:px-16 py-8 flex items-start justify-between gap-8">
        <div>
          <p className="label-mono text-primary mb-2">Attract Acquisition</p>
          <h1 className="font-display text-[28px] font-semibold leading-tight text-foreground">
            Financial <span className="text-primary">Tracking Model</span>
          </h1>
          <p className="font-mono text-[11px] text-white-45 mt-1 tracking-[0.06em]">
            Brand Infrastructure for Service Businesses
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pt-0.5">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-2.5 py-1">
            Monthly Tracking
          </span>
          <span className="font-mono text-[10px] text-white-45 tracking-[0.08em]">
            Updated {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 font-mono text-[10px] text-white-45 hover:text-loss transition-colors tracking-[0.06em]"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          )}
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-background border-b border-border px-8 lg:px-16 flex gap-8">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`font-mono text-[11px] tracking-[0.1em] uppercase py-4 border-b-2 transition-colors ${
                active
                  ? "text-primary border-primary"
                  : "text-white-45 border-transparent hover:text-primary hover:border-primary"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Main */}
      <main className="max-w-[900px] mx-auto px-8 lg:px-16 py-12 space-y-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary animate-pulse">
              Loading financial data…
            </span>
          </div>
        ) : (
          <>
            {/* Summary section */}
            <section>
              <p className="label-mono text-primary mb-2">Snapshot</p>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Current Period</h2>
              <p className="text-[14px] text-white-45 mb-8 pb-6 border-b border-border">
                Key metrics for the latest recorded month — {entries.length > 0
                  ? new Date(entries[entries.length - 1].month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "No data yet"}
              </p>
              <SummaryCards entries={entries} />
            </section>

            {/* Cumulative trust callout */}
            <div className="border border-teal-border bg-teal-dim rounded-md px-6 py-5 flex items-center justify-between gap-8">
              <div>
                <p className="label-mono text-primary mb-1">Cumulative Trust Surplus</p>
                <p className="text-[13px] text-white-80 max-w-[520px] leading-relaxed">
                  Reserve across all recorded periods. Supports tax obligations, quarterly estimates, and emergency operating capital.
                  <span className="text-white-45 ml-2 text-[12px]">Brand = Proof × Volume × Consistency.</span>
                </p>
              </div>
              <span className="font-display text-[22px] text-primary whitespace-nowrap">
                {formatCurrency(cumulativeTrust)}
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-8 lg:px-16 py-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white-45">
          Attract Acquisition · Financial Tracking Model
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-primary">
          Confidential
        </span>
      </footer>
    </div>
  );
}
