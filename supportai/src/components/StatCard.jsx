// One metric: label, value and the period or note it applies to.
export default function StatCard({ label, value, hint, warn = false }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className={`mt-1 text-xs ${warn ? "font-medium text-warn" : "text-muted"}`}>{hint}</p>
    </div>
  );
}
