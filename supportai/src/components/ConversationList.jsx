import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import EmptyState from "./EmptyState.jsx";
import { statusOf } from "../useChat.js";
import { formatStamp } from "../format.js";

export default function ConversationList({ conversations, selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((c) => status === "all" || statusOf(c) === status)
      .filter((c) => !q || c.subject.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)));
  }, [conversations, query, status]);

  const filtering = query.trim() !== "" || status !== "all";

  return (
    <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="space-y-2 border-b border-line p-3">
        <div className="relative">
          <label htmlFor="conv-search" className="sr-only">Search conversations</label>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="conv-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" className="input pl-9" />
        </div>
        <div>
          <label htmlFor="conv-status" className="sr-only">Filter by status</label>
          <select id="conv-status" value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="escalated">Needs human</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {conversations.length === 0 ? (
        <EmptyState title="No conversations yet">Start a new conversation and it will be listed here.</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No matches"
          action={filtering && <button className="btn btn-secondary" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button>}
        >
          No conversations match your search or filter.
        </EmptyState>
      ) : (
        <ul className="scroll-slim min-h-0 flex-1 overflow-y-auto">
          {visible.map((c) => {
            const selected = c.id === selectedId;
            return (
              <li key={c.id} className="border-b border-line last:border-b-0">
                <button
                  onClick={() => onSelect(c.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`block w-full border-l-2 px-4 py-3 text-left transition-colors ${
                    selected ? "border-l-accent bg-accent-soft" : "border-l-transparent hover:bg-canvas"
                  }`}
                >
                  <span className="block truncate text-sm font-medium">{c.subject}</span>
                  <span className="mt-1.5 flex items-center justify-between gap-2">
                    <StatusBadge status={statusOf(c)} />
                    <span className="text-xs text-muted">{formatStamp(c.updatedAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
