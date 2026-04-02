export interface MonthlyEntry {
  id: string;
  month: string; // "2024-01" format
  mrr: number;
  costs: number;
  draw: number;
  trustPercent: number; // e.g. 30 for 30%
}

export interface ComputedEntry extends MonthlyEntry {
  netProfit: number;
  trustSurplus: number;
  takeHome: number;
}

export function computeEntry(entry: MonthlyEntry): ComputedEntry {
  const netProfit = entry.mrr - entry.costs;
  const trustSurplus = netProfit * (entry.trustPercent / 100);
  const takeHome = netProfit - trustSurplus - entry.draw;
  return { ...entry, netProfit, trustSurplus, takeHome };
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return value < 0 ? `(${formatted})` : formatted;
}

export function getMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const STORAGE_KEY = "llc-financial-data";

export function loadEntries(): MonthlyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultEntries();
}

export function saveEntries(entries: MonthlyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getDefaultEntries(): MonthlyEntry[] {
  const now = new Date();
  const entries: MonthlyEntry[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    entries.push({
      id: crypto.randomUUID(),
      month,
      mrr: 8000 + Math.floor(Math.random() * 4000),
      costs: 2000 + Math.floor(Math.random() * 1500),
      draw: 3000,
      trustPercent: 30,
    });
  }
  return entries;
}
