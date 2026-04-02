import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, AlertTriangle, CheckCheck, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

interface CorrectiveAction {
  action: string;
  owner: string;
  deadline: string;
  status: "Open" | "In Progress" | "Done";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { label: "Overview", path: "/" },
  { label: "Quarterly Review", path: "/quarterly-review" },
];

const PHASES: { id: string; label: string; items: string[] }[] = [
  {
    id: "data",
    label: "Phase 1 — Data Collection",
    items: [
      "Pull MRR figures from tracking_model for all months in the quarter",
      "Confirm all client retainers are correctly categorised (MRR vs One-off)",
      "Pull all cost line items from the ledger",
      "Reconcile bank statement against recorded transactions",
      "Export trust surplus balance and verify against trust account statement",
    ],
  },
  {
    id: "variance",
    label: "Phase 2 — Variance Calculation",
    items: [
      "Calculate average MRR for the quarter",
      "Calculate variance vs prior quarter average MRR",
      "Flag any month with ±20% variance from quarterly average",
      "Document which months triggered the Amber or Red threshold",
      "Calculate Net Profit margin % for each month in quarter",
    ],
  },
  {
    id: "pipeline",
    label: "Phase 3 — Pipeline Analysis",
    items: [
      "Review Proof Sprint pipeline — how many in trial this quarter?",
      "Calculate conversion rate: Proof Sprint → retained client",
      "Review churn: any clients off-boarded this quarter?",
      "Net MRR movement = New MRR − Churned MRR",
      "Identify upsell opportunities for existing clients (tier upgrade flags)",
    ],
  },
  {
    id: "ops",
    label: "Phase 4 — Operational Health",
    items: [
      "Review delivery metrics for all active clients",
      "Check VA utilisation and capacity headroom",
      "Review all overdue tasks and SOP compliance",
      "Assess ad spend efficiency (ROAS vs benchmark) for Proof Sprints",
      "Owner wellbeing check — draw level sustainable vs workload?",
    ],
  },
  {
    id: "planning",
    label: "Phase 5 — Next Quarter Planning",
    items: [
      "Set MRR target for next quarter (conservative + stretch)",
      "Define minimum 2 new Proof Sprint commitments",
      "Confirm trust surplus allocation for next quarter's tax estimate",
      "Update any pricing or offer structure if needed",
      "Schedule next Quarterly Review date",
    ],
  },
];

const DEFAULT_CORRECTIVE_ACTIONS: CorrectiveAction[] = [
  { action: "Identify root cause of MRR decline", owner: "Owner", deadline: "", status: "Open" },
  { action: "Prepare client retention offers for at-risk accounts", owner: "Account Manager", deadline: "", status: "Open" },
  { action: "Adjust ad spend targeting or creative", owner: "VA / Specialist", deadline: "", status: "Open" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors"
      >
        <span className="font-display text-[16px] font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-white-45" />}
      </button>
      {open && <div className="px-6 pb-6 pt-1 border-t border-border">{children}</div>}
    </div>
  );
}

function VarianceBadge({ zone }: { zone: "green" | "amber" | "red" }) {
  const styles = {
    green: "bg-profit/10 border-profit/30 text-profit",
    amber: "bg-draw/10 border-draw/30 text-draw",
    red: "bg-loss/10 border-loss/30 text-loss",
  };
  const labels = { green: "Green Zone", amber: "Amber Zone", red: "Red Zone" };
  const icons = {
    green: <CheckCheck className="h-3.5 w-3.5" />,
    amber: <AlertTriangle className="h-3.5 w-3.5" />,
    red: <XCircle className="h-3.5 w-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase border rounded-[3px] px-2.5 py-1 ${styles[zone]}`}>
      {icons[zone]} {labels[zone]}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QFinancialReview() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, ChecklistItem[]>>(
    Object.fromEntries(
      PHASES.map((p) => [
        p.id,
        p.items.map((text, i) => ({ id: `${p.id}-${i}`, text, done: false })),
      ])
    )
  );

  const toggleItem = (phaseId: string, itemId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [phaseId]: prev[phaseId].map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const totalItems = Object.values(checklist).flat().length;
  const doneItems = Object.values(checklist).flat().filter((i) => i.done).length;
  const progress = Math.round((doneItems / totalItems) * 100);

  // Corrective plan state
  const [rootCause, setRootCause] = useState("");
  const [impactAssessment, setImpactAssessment] = useState("");
  const [actions, setActions] = useState<CorrectiveAction[]>(DEFAULT_CORRECTIVE_ACTIONS);

  const updateAction = (idx: number, field: keyof CorrectiveAction, value: string) => {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const addAction = () => {
    setActions((prev) => [...prev, { action: "", owner: "", deadline: "", status: "Open" }]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 lg:px-16 py-8 flex items-start justify-between gap-8">
        <div>
          <p className="label-mono text-primary mb-2">Attract Acquisition</p>
          <h1 className="font-display text-[28px] font-semibold leading-tight text-foreground">
            Quarterly <span className="text-primary">Financial Review</span>
          </h1>
          <p className="font-mono text-[11px] text-white-45 mt-1 tracking-[0.06em]">
            Brand Infrastructure for Service Businesses
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pt-0.5">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-2.5 py-1">
            Q Review Process
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

      <main className="max-w-[900px] mx-auto px-8 lg:px-16 py-12 space-y-10">

        {/* ── Review Cadence & Triggers ── */}
        <section>
          <p className="label-mono text-primary mb-2">Schedule</p>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Review Cadence & Triggers</h2>
          <p className="text-[14px] text-white-45 mb-8 pb-6 border-b border-border">
            When to run this process and what forces an emergency review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Standard Cadence", value: "End of each quarter", sub: "Jan · Apr · Jul · Oct" },
              { label: "MRR Variance Trigger", value: "±20% vs prior month", sub: "Emergency review within 14 days" },
              { label: "Corrective Plan Deadline", value: "14 calendar days", sub: "From trigger date" },
            ].map((card) => (
              <div key={card.label} className="bg-card border border-border rounded-md p-5">
                <p className="label-mono text-primary mb-2">{card.label}</p>
                <p className="font-display text-[18px] font-semibold text-foreground">{card.value}</p>
                <p className="font-mono text-[11px] text-white-45 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="bg-card border border-teal-border rounded-md px-6 py-5">
            <p className="label-mono text-primary mb-4">Key Milestones</p>
            <div className="space-y-3">
              {[
                { date: "Q4 2026 (Oct–Dec)", target: "Stabilise MRR ≥ R80,000/month — remove R0 management fee offer" },
                { date: "Q1 2027 (Jan–Mar)", target: "Scale to R120,000 MRR — hire first full-time Account Manager" },
                { date: "Ongoing", target: "Trust Surplus ≥ 30% of net profit each month" },
              ].map((m) => (
                <div key={m.date} className="flex items-start gap-4 py-2 border-b border-border last:border-0">
                  <span className="font-mono text-[11px] text-primary whitespace-nowrap pt-0.5 min-w-[130px]">{m.date}</span>
                  <span className="text-[13px] text-white-80">{m.target}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MRR Framework ── */}
        <Accordion title="MRR Framework — What Counts?" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="label-mono text-profit mb-3">Counts as MRR</p>
              <ul className="space-y-2">
                {[
                  "Monthly retainer fees from active clients",
                  "Recurring ad management fees",
                  "Fixed monthly content/creative fees",
                  "White-label / sub-contractor monthly fees",
                  "Recurring platform access fees (SaaS-style)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-white-80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-profit mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label-mono text-loss mb-3">Does NOT count as MRR</p>
              <ul className="space-y-2">
                {[
                  "One-off setup fees (Proof Brand / Authority Brand)",
                  "14-Day Proof Sprint trial (no management fee)",
                  "Ad spend pass-through (client funds, not AA revenue)",
                  "Referral bonuses or one-time commissions",
                  "Grants or non-operating income",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-white-80">
                    <XCircle className="h-3.5 w-3.5 text-loss mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-teal-dim border border-teal-border rounded-md px-4 py-3">
            <p className="text-[13px] text-white-80">
              <span className="text-primary font-mono text-[11px] uppercase tracking-[0.1em] mr-2">Rule:</span>
              If the revenue requires a new agreement, it is one-off. If it continues without re-signing, it is MRR.
            </p>
          </div>
        </Accordion>

        {/* ── Variance Protocol ── */}
        <Accordion title="Variance Protocol — Green / Amber / Red Zones" defaultOpen>
          <div className="space-y-4 mt-4">
            {/* Green */}
            <div className="border border-profit/30 bg-profit/5 rounded-md p-5">
              <div className="flex items-center justify-between mb-3">
                <VarianceBadge zone="green" />
                <span className="font-mono text-[12px] text-profit">MRR variance &lt; ±10%</span>
              </div>
              <p className="text-[13px] text-white-80 mb-2">Business is performing within expected range.</p>
              <ul className="space-y-1">
                {["Continue standard quarterly review", "No corrective plan required", "Focus on growth levers (pipeline, upsells)"].map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[12px] text-white-45">
                    <span className="w-1 h-1 rounded-full bg-profit shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Amber */}
            <div className="border border-draw/30 bg-draw/5 rounded-md p-5">
              <div className="flex items-center justify-between mb-3">
                <VarianceBadge zone="amber" />
                <span className="font-mono text-[12px] text-draw">MRR variance ±10%–20%</span>
              </div>
              <p className="text-[13px] text-white-80 mb-2">Performance degrading — heightened monitoring required.</p>
              <ul className="space-y-1">
                {[
                  "Identify which clients or offers drove the change",
                  "Owner review within 7 days",
                  "Informal corrective memo (not full plan required)",
                  "Increase pipeline activity immediately",
                ].map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[12px] text-white-45">
                    <span className="w-1 h-1 rounded-full bg-draw shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red */}
            <div className="border border-loss/30 bg-loss/5 rounded-md p-5">
              <div className="flex items-center justify-between mb-3">
                <VarianceBadge zone="red" />
                <span className="font-mono text-[12px] text-loss">MRR variance &gt; ±20%</span>
              </div>
              <p className="text-[13px] text-white-80 mb-2">
                <strong className="text-loss">Trigger activated.</strong> Formal Corrective Plan required within 14 calendar days.
              </p>
              <ul className="space-y-1">
                {[
                  "Complete full 5-Phase Review immediately",
                  "Submit written Corrective Plan with owners and deadlines",
                  "Suspend discretionary spend until plan approved",
                  "Weekly check-in until MRR returns to Green Zone",
                  "Review owner draw — reduce if net profit insufficient",
                ].map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[12px] text-white-45">
                    <span className="w-1 h-1 rounded-full bg-loss shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Accordion>

        {/* ── 5-Phase Checklist ── */}
        <section>
          <p className="label-mono text-primary mb-2">Checklist</p>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">5-Phase Review Process</h2>
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <p className="text-[14px] text-white-45">
              Work through each phase in order. Mark items complete as you go.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-primary whitespace-nowrap">{doneItems}/{totalItems}</span>
            </div>
          </div>

          <div className="space-y-4">
            {PHASES.map((phase) => {
              const phaseItems = checklist[phase.id];
              const phaseDone = phaseItems.filter((i) => i.done).length;
              const phaseTotal = phaseItems.length;
              const phaseComplete = phaseDone === phaseTotal;

              return (
                <Accordion key={phase.id} title={`${phase.label} (${phaseDone}/${phaseTotal})`} defaultOpen={phase.id === "data"}>
                  <ul className="space-y-2.5 mt-3">
                    {phaseItems.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => toggleItem(phase.id, item.id)}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-white-45 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                        )}
                        <span className={`text-[13px] transition-colors ${item.done ? "line-through text-white-45" : "text-white-80 group-hover:text-foreground"}`}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {phaseComplete && (
                    <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-primary">
                      <CheckCheck className="h-3.5 w-3.5" /> Phase complete
                    </div>
                  )}
                </Accordion>
              );
            })}
          </div>
        </section>

        {/* ── Corrective Plan Template ── */}
        <section>
          <p className="label-mono text-primary mb-2">Template</p>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Corrective Plan</h2>
          <p className="text-[14px] text-white-45 mb-8 pb-6 border-b border-border">
            Complete when a Red Zone trigger (±20% MRR variance) is activated. Due within 14 calendar days of trigger.
          </p>

          <div className="space-y-6">
            {/* Root cause */}
            <div className="bg-card border border-border rounded-md p-6">
              <p className="label-mono text-primary mb-3">Root Cause Analysis</p>
              <p className="text-[12px] text-white-45 mb-3">Describe the primary cause(s) of the variance. Be specific — name clients, offers, or operational factors.</p>
              <textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g. Client X (R12,000/month) churned after failing Proof Sprint. Two new Proof Sprints stalled in onboarding. No new pipeline activity in October."
                rows={4}
                className="w-full bg-muted border border-border rounded-[5px] px-4 py-3 font-mono text-[13px] text-foreground placeholder:text-white-45 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Impact assessment */}
            <div className="bg-card border border-border rounded-md p-6">
              <p className="label-mono text-primary mb-3">Impact Assessment</p>
              <p className="text-[12px] text-white-45 mb-3">Quantify the impact. MRR lost, runway affected, trust surplus draw-down required?</p>
              <textarea
                value={impactAssessment}
                onChange={(e) => setImpactAssessment(e.target.value)}
                placeholder="e.g. MRR dropped from R68,000 to R52,000 (−24%). Net profit fell to R18,000. Owner draw is unsustainable at current level. Trust surplus buffer is 6 weeks of operating costs."
                rows={4}
                className="w-full bg-muted border border-border rounded-[5px] px-4 py-3 font-mono text-[13px] text-foreground placeholder:text-white-45 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Corrective actions table */}
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <p className="label-mono text-primary">Corrective Actions</p>
                <button
                  onClick={addAction}
                  className="font-mono text-[11px] tracking-[0.1em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  + Add Action
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-teal-border">
                      {["Action", "Owner", "Deadline", "Status"].map((h) => (
                        <th key={h} className="font-mono text-[9px] tracking-[0.15em] uppercase text-primary font-normal px-4 py-3 text-left first:pl-6 last:pr-6">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((action, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 pl-6">
                          <input
                            value={action.action}
                            onChange={(e) => updateAction(idx, "action", e.target.value)}
                            placeholder="Describe the action…"
                            className="w-full bg-transparent font-mono text-[12px] text-foreground placeholder:text-white-45 outline-none focus:text-primary transition-colors min-w-[200px]"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            value={action.owner}
                            onChange={(e) => updateAction(idx, "owner", e.target.value)}
                            placeholder="Owner"
                            className="w-full bg-transparent font-mono text-[12px] text-white-80 placeholder:text-white-45 outline-none focus:text-primary transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="date"
                            value={action.deadline}
                            onChange={(e) => updateAction(idx, "deadline", e.target.value)}
                            className="bg-transparent font-mono text-[12px] text-white-80 outline-none focus:text-primary transition-colors [color-scheme:dark]"
                          />
                        </td>
                        <td className="px-4 py-2.5 pr-6">
                          <select
                            value={action.status}
                            onChange={(e) => updateAction(idx, "status", e.target.value as CorrectiveAction["status"])}
                            className={`bg-transparent font-mono text-[11px] uppercase tracking-[0.08em] outline-none cursor-pointer ${
                              action.status === "Done" ? "text-profit" : action.status === "In Progress" ? "text-draw" : "text-white-45"
                            }`}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-8 lg:px-16 py-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white-45">
          Attract Acquisition · Quarterly Financial Review
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-primary">
          Confidential
        </span>
      </footer>
    </div>
  );
}
