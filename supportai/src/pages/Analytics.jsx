import PageHeader from "../components/PageHeader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { IS_MOCK } from "../api.js";
import { statusOf } from "../useChat.js";
import { formatDuration } from "../format.js";

function BarRows({ rows, unit }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span>{r.label}</span>
            <span className="tabular-nums text-muted">{r.value} {unit}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-canvas">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, note, children }) {
  return (
    <section className="card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const pretty = (s) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function Analytics({ conversations, sessionStart }) {
  const since = new Date(sessionStart).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const statusRows = [
    { label: "Open", value: conversations.filter((c) => statusOf(c) === "open").length },
    { label: "Needs human", value: conversations.filter((c) => statusOf(c) === "escalated").length },
    { label: "Resolved", value: conversations.filter((c) => c.resolved).length },
  ];

  const issueCounts = {};
  conversations.forEach((c) => { if (c.issueType) issueCounts[c.issueType] = (issueCounts[c.issueType] || 0) + 1; });
  const issueRows = Object.entries(issueCounts).map(([k, v]) => ({ label: pretty(k), value: v })).sort((a, b) => b.value - a.value);

  const times = conversations.flatMap((c) => c.replyTimes);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Based on conversations in this browser session, since ${since}. Data is cleared when the page is reloaded.`}
      />

      {conversations.length === 0 ? (
        <div className="card mt-6">
          <EmptyState title="No data yet">Charts appear here once there are conversations in this session.</EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Section title="Conversations by status" note="Number of conversations · this session">
            <BarRows rows={statusRows} unit="" />
          </Section>

          <Section title="Issue types" note="Number of conversations · from the assistant's issue_type">
            {issueRows.length ? (
              <BarRows rows={issueRows} unit="" />
            ) : (
              <p className="text-sm text-muted">
                {IS_MOCK ? "Demo replies don't include an issue type." : "The assistant hasn't reported an issue type yet."}
              </p>
            )}
          </Section>

          <Section title="Reply time" note={IS_MOCK ? "Time to receive a reply · simulated in demo mode" : "Time to receive a reply · this session"}>
            {times.length ? (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Replies", times.length],
                  ["Average", formatDuration(avg)],
                  ["Fastest", formatDuration(Math.min(...times))],
                  ["Slowest", formatDuration(Math.max(...times))],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted">No replies received yet.</p>
            )}
          </Section>
        </div>
      )}
    </>
  );
}
