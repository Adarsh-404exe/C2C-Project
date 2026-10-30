import { MessageSquarePlus } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import ConversationList from "../components/ConversationList.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { HANDOFF_TEXT } from "../useChat.js";

// selectedId: a conversation id, "new" for a conversation not started yet, or null for nothing selected.
export default function Conversations({ chat, selectedId, onSelect }) {
  const selected = chat.conversations.find((c) => c.id === selectedId) ?? null;
  const isDraft = selectedId === "new";
  const hasSelection = isDraft || Boolean(selected);

  const handleSend = (text, attachment) => {
    const id = chat.send(isDraft ? null : selected.id, text, attachment);
    if (id && isDraft) onSelect(id);
    return Boolean(id);
  };

  return (
    <>
      {/* On phones the page title is hidden while a conversation is open, to leave room for messages. */}
      <PageHeader
        title="Conversations"
        description="Open a conversation to continue it, resolve it, or hand it off to a human agent."
        className={hasSelection ? "hidden lg:flex" : ""}
      >
        <button onClick={() => onSelect("new")} className="btn btn-primary"><MessageSquarePlus size={16} /> New conversation</button>
      </PageHeader>

      <div className="mt-4 flex min-h-0 flex-1 gap-4">
        <div className={`${hasSelection ? "hidden" : "flex"} min-h-0 w-full flex-col lg:flex lg:w-80 lg:shrink-0`}>
          <ConversationList conversations={chat.conversations} selectedId={selectedId} onSelect={onSelect} />
        </div>

        <div className={`${hasSelection ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col lg:flex`}>
          {hasSelection ? (
            <ChatPanel
              key={selectedId}
              conversation={selected}
              typing={Boolean(selected && chat.pending[selected.id])}
              onSend={handleSend}
              onRetry={() => chat.retry(selected.id, selected.failedQuery)}
              onResolve={() => chat.setResolved(selected.id, true)}
              onReopen={() => chat.setResolved(selected.id, false)}
              onHandoff={() => chat.send(selected.id, HANDOFF_TEXT)}
              onBack={() => onSelect(null)}
            />
          ) : (
            <div className="card flex flex-1 items-center justify-center">
              <EmptyState title="No conversation selected" action={<button onClick={() => onSelect("new")} className="btn btn-primary">New conversation</button>}>
                Choose a conversation from the list, or start a new one.
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
