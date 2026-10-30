import { LayoutDashboard, MessageSquare, BookOpen, BarChart3, Settings, LifeBuoy, X } from "lucide-react";
import { Dot } from "./StatusBadge.jsx";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ active, onChange, open, onClose, system, waiting }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-ink/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-line bg-surface px-3 py-4 transition-transform duration-200 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white"><LifeBuoy size={18} /></div>
            <span className="text-base font-semibold tracking-tight">SupportAI</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-canvas lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1" aria-label="Main navigation">
          {NAV.map(({ id, label, icon: Icon }) => {
            const on = active === id;
            return (
              <button
                key={id}
                onClick={() => { onChange(id); onClose(); }}
                aria-current={on ? "page" : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-sm font-medium transition-colors ${
                  on ? "bg-accent-soft text-accent" : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-line px-2.5 pt-3">
          <p className="text-xs font-medium text-muted">Support status</p>
          <p className="mt-2 flex items-center gap-2 text-sm"><Dot tone={system.tone} />{system.label}</p>
          <p className="mt-1 pl-4 text-xs text-muted">
            {waiting > 0 ? `${waiting} waiting for a human` : "No handoffs waiting"}
          </p>
        </div>
      </aside>
    </>
  );
}
