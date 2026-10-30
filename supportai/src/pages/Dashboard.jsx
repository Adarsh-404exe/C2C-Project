import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge, { Dot } from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { IS_MOCK } from "../api.js";
import { statusOf } from "../useChat.js";
import { formatDuration, formatStamp } from "../format.js";

const MAX_ROWS = 8;
const rank = (c) => (statusOf(c) === "escalated" ? 0 : 1); // conversations waiting for a human come first

export default function Dashboard({ conversations, stats, system, onOpen, onNew, onViewAll }) {
  const rows = [...conversations].sort((a, b) => rank(a) - rank(b) || b.updatedAt - a.updatedAt).slice(0, MAX_ROWS);

  return (
    <>
      <PageHeader title="Dashboard" description="Support workload and recent activity for this session.">
        <span className="flex items-center gap-2 text-xs text-muted" title={system.detail}>
          <Dot tone={system.tone} /> {system.label}
        </span>
        <button onClick={onNew} className="btn btn-primary">New conversation</button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total conversations" value={stats.total} hint="This session" />
        <StatCard
          label="Open conversations"
          value={stats.open}
          hint={stats.escalated > 0 ? `${stats.escalated} need a human` : "Not yet resolved"}
          warn={stats.escalated > 0}
        />
        <StatCard
          label="Avg. first response"
          value={formatDuration(stats.avgFirstResponse)}
          hint={IS_MOCK ? "This session · simulated" : "This session"}
        />
        <StatCard
          label="Resolution rate"
          value={stats.resolutionRate == null ? "—" : `${stats.resolutionRate}%`}
          hint="Marked resolved · this session"
        />
      </div>

      <section className="card mt-6 overflow-hidden" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 id="recent-heading" className="text-sm font-semibold">Recent conversations</h2>
            <p className="text-xs text-muted">Conversations that need a human are listed first.</p>
          </div>
          {conversations.length > 0 && (
            <button onClick={onViewAll} className="text-sm font-medium text-accent hover:underline">View all</button>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No conversations yet" action={<button onClick={onNew} className="btn btn-primary">Start a conversation</button>}>
            Conversations from this session will appear here with their status and last update.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">Subject</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">Last updated</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas">
                    <td className="max-w-[16rem] truncate px-4 py-3 font-medium sm:max-w-md">{c.subject}</td>
                    <td className="px-4 py-3"><StatusBadge status={statusOf(c)} /></td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted sm:table-cell">{formatStamp(c.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onOpen(c.id)} className="btn btn-secondary h-8 px-3" aria-label={`Open conversation: ${c.subject}`}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
