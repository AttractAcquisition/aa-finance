import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyEntry, ComputedEntry, formatCurrency, getMonthLabel } from "@/lib/financial-data";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  entries: ComputedEntry[];
  onUpdate: (entries: MonthlyEntry[]) => void;
  rawEntries: MonthlyEntry[];
}

export function MonthlyTable({ entries, onUpdate, rawEntries }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<MonthlyEntry>>({});

  const startEdit = (entry: MonthlyEntry) => {
    setEditingId(entry.id);
    setEditValues({ mrr: entry.mrr, costs: entry.costs, draw: entry.draw, trustPercent: entry.trustPercent });
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdate(rawEntries.map((e) => (e.id === editingId ? { ...e, ...editValues } : e)));
    setEditingId(null);
  };

  const addMonth = () => {
    const last = rawEntries[rawEntries.length - 1];
    const [y, m] = last ? last.month.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const nextDate = new Date(y, m);
    const month = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    onUpdate([
      ...rawEntries,
      { id: crypto.randomUUID(), month, mrr: last?.mrr ?? 0, costs: last?.costs ?? 0, draw: last?.draw ?? 0, trustPercent: last?.trustPercent ?? 30 },
    ]);
  };

  const deleteMonth = (id: string) => onUpdate(rawEntries.filter((e) => e.id !== id));

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <p className="label-mono text-primary mb-1">Ledger</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Monthly Breakdown</h2>
        </div>
        <button
          onClick={addMonth}
          className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Plus className="h-3 w-3" /> Add Month
          </span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-teal-border">
              {["Month", "MRR", "Costs", "Net Profit", "Draw", "Trust %", "Trust $", "Take Home", ""].map((h) => (
                <th
                  key={h}
                  className="font-mono text-[9px] tracking-[0.15em] uppercase text-primary font-normal px-4 py-3 text-left first:pl-6 last:pr-6"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isEditing = editingId === entry.id;
              return (
                <tr
                  key={entry.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => !isEditing && startEdit(entry)}
                >
                  <td className="px-4 py-3 pl-6 font-medium text-foreground">{getMonthLabel(entry.month)}</td>
                  {isEditing ? (
                    <>
                      <EditCell value={editValues.mrr!} onChange={(v) => setEditValues({ ...editValues, mrr: v })} />
                      <EditCell value={editValues.costs!} onChange={(v) => setEditValues({ ...editValues, costs: v })} />
                      <td className="px-4 py-3 font-mono text-white-45">—</td>
                      <EditCell value={editValues.draw!} onChange={(v) => setEditValues({ ...editValues, draw: v })} />
                      <EditCell value={editValues.trustPercent!} onChange={(v) => setEditValues({ ...editValues, trustPercent: v })} suffix="%" />
                      <td className="px-4 py-3 font-mono text-white-45">—</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                          className="font-mono text-[10px] tracking-[0.1em] uppercase bg-primary text-primary-foreground rounded-[3px] px-3 py-1 hover:opacity-90 transition-opacity"
                        >
                          Save
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-white-80">{formatCurrency(entry.mrr)}</td>
                      <td className="px-4 py-3 font-mono text-white-80">{formatCurrency(entry.costs)}</td>
                      <td className={`px-4 py-3 font-mono ${entry.netProfit >= 0 ? "text-profit" : "text-loss"}`}>
                        {formatCurrency(entry.netProfit)}
                      </td>
                      <td className="px-4 py-3 font-mono text-draw">{formatCurrency(entry.draw)}</td>
                      <td className="px-4 py-3 font-mono text-white-80">{entry.trustPercent}%</td>
                      <td className="px-4 py-3 font-mono text-trust">{formatCurrency(entry.trustSurplus)}</td>
                      <td className={`px-4 py-3 font-mono font-medium ${entry.takeHome >= 0 ? "text-profit" : "text-loss"}`}>
                        {formatCurrency(entry.takeHome)}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 pr-6">
                    <button
                      className="text-white-45 hover:text-loss transition-colors"
                      onClick={(e) => { e.stopPropagation(); deleteMonth(entry.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditCell({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 h-7 text-right font-mono text-[13px] bg-muted border border-border rounded-[3px] px-2 text-foreground outline-none focus:border-primary"
        />
        {suffix && <span className="text-[11px] text-white-45">{suffix}</span>}
      </div>
    </td>
  );
}
