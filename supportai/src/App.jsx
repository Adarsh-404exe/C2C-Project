import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Conversations from "./pages/Conversations.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import { summarize, useChat } from "./useChat.js";
import { systemStatus } from "./status.js";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // conversation id, "new", or null
  const chat = useChat();

  const stats = useMemo(() => summarize(chat.conversations), [chat.conversations]);
  const system = systemStatus(chat.health);

  const openConversation = (id) => { setSelectedId(id); setView("conversations"); };

  const pages = {
    dashboard: (
      <Dashboard
        conversations={chat.conversations}
        stats={stats}
        system={system}
        onOpen={openConversation}
        onNew={() => openConversation("new")}
        onViewAll={() => { setSelectedId(null); setView("conversations"); }}
      />
    ),
    knowledge: <KnowledgeBase />,
    analytics: <Analytics conversations={chat.conversations} sessionStart={chat.sessionStart} />,
    settings: <Settings system={system} />,
  };

  // The conversations page fills the screen and scrolls inside its own panes; other pages scroll as a whole.
  const fullHeight = view === "conversations";

  return (
    <div className="flex h-full">
      <Sidebar active={view} onChange={setView} open={menuOpen} onClose={() => setMenuOpen(false)} system={system} waiting={stats.escalated} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <button onClick={() => setMenuOpen(true)} className="rounded-md border border-line p-2 text-ink" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <span className="font-semibold">SupportAI</span>
        </div>

        {fullHeight ? (
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <Conversations chat={chat} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        ) : (
          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{pages[view]}</div>
          </div>
        )}
      </main>
    </div>
  );
}
