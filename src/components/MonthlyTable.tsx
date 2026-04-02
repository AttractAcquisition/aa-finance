import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const updated = rawEntries.map((e) =>
      e.id === editingId ? { ...e, ...editValues } : e
    );
    onUpdate(updated);
    setEditingId(null);
  };

  const addMonth = () => {
    const last = rawEntries[rawEntries.length - 1];
    const [y, m] = last ? last.month.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const nextDate = new Date(y, m); // m is already 1-based, so this goes to next month
    const month = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    onUpdate([
      ...rawEntries,
      {
        id: crypto.randomUUID(),
        month,
        mrr: last?.mrr ?? 0,
        costs: last?.costs ?? 0,
        draw: last?.draw ?? 0,
        trustPercent: last?.trustPercent ?? 30,
      },
    ]);
  };

  const deleteMonth = (id: string) => {
    onUpdate(rawEntries.filter((e) => e.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
        <Button onClick={addMonth} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Month
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Month</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead className="text-right">Costs</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
              <TableHead className="text-right">Draw</TableHead>
              <TableHead className="text-right">Trust %</TableHead>
              <TableHead className="text-right">Trust $</TableHead>
              <TableHead className="text-right pr-6">Take Home</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isEditing = editingId === entry.id;
              return (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => !isEditing && startEdit(entry)}
                >
                  <TableCell className="pl-6 font-medium">{getMonthLabel(entry.month)}</TableCell>
                  {isEditing ? (
                    <>
                      <EditCell value={editValues.mrr!} onChange={(v) => setEditValues({ ...editValues, mrr: v })} />
                      <EditCell value={editValues.costs!} onChange={(v) => setEditValues({ ...editValues, costs: v })} />
                      <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                      <EditCell value={editValues.draw!} onChange={(v) => setEditValues({ ...editValues, draw: v })} />
                      <EditCell value={editValues.trustPercent!} onChange={(v) => setEditValues({ ...editValues, trustPercent: v })} suffix="%" />
                      <TableCell className="text-right font-mono text-muted-foreground">—</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); saveEdit(); }}>
                          Save
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.mrr)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.costs)}</TableCell>
                      <TableCell className={`text-right font-mono ${entry.netProfit >= 0 ? "text-profit" : "text-loss"}`}>
                        {formatCurrency(entry.netProfit)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-draw">{formatCurrency(entry.draw)}</TableCell>
                      <TableCell className="text-right font-mono">{entry.trustPercent}%</TableCell>
                      <TableCell className="text-right font-mono text-trust">{formatCurrency(entry.trustSurplus)}</TableCell>
                      <TableCell className={`text-right pr-6 font-mono font-semibold ${entry.takeHome >= 0 ? "text-profit" : "text-loss"}`}>
                        {formatCurrency(entry.takeHome)}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-loss"
                      onClick={(e) => { e.stopPropagation(); deleteMonth(entry.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EditCell({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-1">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 h-8 text-right font-mono text-sm"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </TableCell>
  );
}
