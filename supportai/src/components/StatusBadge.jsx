const DOT = { ok: "bg-ok", bad: "bg-bad", neutral: "bg-muted" };

export function Dot({ tone = "neutral" }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden="true" />;
}

const BADGES = {
  open: { label: "Open", cls: "border border-line bg-canvas text-muted" },
  escalated: { label: "Needs human", cls: "bg-warn-soft text-warn" },
  resolved: { label: "Resolved", cls: "bg-ok-soft text-ok" },
};

export default function StatusBadge({ status }) {
  const { label, cls } = BADGES[status];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}
