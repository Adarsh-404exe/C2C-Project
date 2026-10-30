import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Check, FileText, Paperclip, RefreshCw, RotateCcw, Send, TriangleAlert, UserRound, X } from "lucide-react";
import { IS_MOCK } from "../api.js";
import { formatStamp } from "../format.js";
import { statusOf, welcomeMessage } from "../useChat.js";
import StatusBadge from "./StatusBadge.jsx";

const QUICK_REPLIES = ["Track my order", "Billing support", "I want to return an item"];

function Message({ msg }) {
  const mine = msg.role === "user";
  const bubble = mine
    ? "border-accent/20 bg-accent-soft"
    : msg.error
      ? "border-bad/25 bg-bad-soft text-bad"
      : "border-line bg-canvas";
  return (
    <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="font-medium text-ink">{mine ? "You" : "SupportAI"}</span>
        {msg.at && <time dateTime={new Date(msg.at).toISOString()}>{formatStamp(msg.at)}</time>}
      </div>
      <div className={`max-w-[88%] rounded-lg border px-3.5 py-2.5 leading-relaxed sm:max-w-[75%] ${bubble}`}>
        {msg.attachment && (
          <span className="mb-1.5 flex w-fit items-center gap-1.5 rounded-md bg-surface/70 px-2 py-0.5 text-xs">
            <FileText size={13} /> {msg.attachment}
          </span>
        )}
        <p className="whitespace-pre-wrap break-words">
          {msg.error && <TriangleAlert size={14} className="mr-1.5 inline -translate-y-px" aria-label="Error" />}
          {msg.text}
        </p>
        {msg.escalated && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">
            <UserRound size={12} /> Needs a human agent to review
          </span>
        )}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex flex-col items-start gap-1" role="status">
      <span className="text-xs font-medium">SupportAI</span>
      <span className="sr-only">SupportAI is typing</span>
      <div className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3.5 py-3.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-dot rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// conversation = null means a new conversation that has not been started yet.
export default function ChatPanel({ conversation, typing, onSend, onRetry, onResolve, onReopen, onHandoff, onBack }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const draftMessages = useMemo(() => [welcomeMessage(null)], []);
  const messages = conversation ? conversation.messages : draftMessages;
  const status = conversation ? statusOf(conversation) : "open";

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  const submit = (value = text) => {
    if (onSend(value, file?.name)) {
      setText("");
      setFile(null);
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
  };

  const onChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <section className="card flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Conversation">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <button onClick={onBack} className="-ml-1 rounded-md p-1.5 text-muted hover:bg-canvas lg:hidden" aria-label="Back to conversations">
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1 basis-48">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold">{conversation ? conversation.subject : "New conversation"}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {conversation
              ? `Started ${formatStamp(conversation.createdAt)}${conversation.issueType ? ` · Issue type: ${conversation.issueType}` : ""}`
              : "Send a message to start"}
          </p>
        </div>
        {conversation && (
          <div className="flex items-center gap-2">
            <button onClick={onHandoff} disabled={typing || conversation.escalated || conversation.resolved} className="btn btn-secondary">
              <UserRound size={15} /> {conversation.escalated ? "Handoff requested" : "Hand off to human"}
            </button>
            {conversation.resolved ? (
              <button onClick={onReopen} className="btn btn-secondary"><RotateCcw size={15} /> Reopen</button>
            ) : (
              <button onClick={onResolve} className="btn btn-secondary"><Check size={15} /> Mark resolved</button>
            )}
          </div>
        )}
      </header>

      <div ref={listRef} className="scroll-slim min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.map((m) => <Message key={m.id} msg={m} />)}
        {typing && <Typing />}
      </div>

      <footer className="border-t border-line p-3">
        <div className="scroll-slim mb-2 flex gap-2 overflow-x-auto pb-1">
          {conversation?.failedQuery && !typing && (
            <button onClick={onRetry} className="btn btn-secondary h-8 shrink-0 border-bad/30 px-3 text-xs text-bad">
              <RefreshCw size={13} /> Retry last message
            </button>
          )}
          {QUICK_REPLIES.map((q) => (
            <button key={q} onClick={() => submit(q)} disabled={typing} className="btn btn-secondary h-8 shrink-0 px-3 text-xs">
              {q}
            </button>
          ))}
        </div>

        {file && (
          <div className="mb-2 flex w-fit max-w-full items-center gap-2 rounded-md border border-line bg-canvas px-2.5 py-1 text-xs">
            <FileText size={13} className="text-muted" />
            <span className="truncate">{file.name}</span>
            <button onClick={() => setFile(null)} aria-label="Remove attachment" className="text-muted hover:text-ink"><X size={13} /></button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-md border border-line bg-surface p-1.5 focus-within:border-accent">
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={() => fileRef.current?.click()} className="rounded-md p-2 text-muted hover:bg-canvas hover:text-ink" aria-label="Attach a file">
            <Paperclip size={18} />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={onChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Type a message"
            maxLength={1000}
            aria-label="Message"
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-sm placeholder:text-muted focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button onClick={() => submit()} disabled={!text.trim() || typing} className="btn btn-primary">
            <Send size={15} /> Send
          </button>
        </div>
        <p className="mt-2 px-1 text-xs text-muted">
          Tip: include an order ID such as ORD1001 so the assistant can find the order.{IS_MOCK && " Demo mode: replies are simulated."}
        </p>
      </footer>
    </section>
  );
}
