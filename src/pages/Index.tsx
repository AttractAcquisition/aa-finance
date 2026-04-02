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
} from "@/lib/financial-data";
import { Building2 } from "lucide-react";

export default function Index() {
  const [rawEntries, setRawEntries] = useState<MonthlyEntry[]>(loadEntries);

  const entries = useMemo(() => rawEntries.map(computeEntry), [rawEntries]);

  const handleUpdate = (updated: MonthlyEntry[]) => {
    setRawEntries(updated);
    saveEntries(updated);
  };

  const totalTrust = entries.reduce((s, e) => s + e.trustSurplus, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">LLC Financials</h1>
              <p className="text-xs text-muted-foreground">Monthly tracking model</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cumulative Trust</p>
            <p className="text-lg font-semibold font-mono text-trust">{formatCurrency(totalTrust)}</p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <SummaryCards entries={entries} />
        <ProfitChart entries={entries} />
        <MonthlyTable entries={entries} onUpdate={handleUpdate} rawEntries={rawEntries} />
      </main>
    </div>
  );
}
