import { useCallback, useRef, useState } from "react";
import { askSupport } from "./api.js";

let counter = 0;
const nextId = () => `m${Date.now()}-${counter++}`;

export const HANDOFF_TEXT = "I want to talk to an agent";
const WELCOME_TEXT = "Hi there! How can I help you today?";

export const welcomeMessage = (at) => ({ id: nextId(), role: "ai", text: WELCOME_TEXT, at });

// A conversation is "resolved" (marked by the user), "escalated" (the API asked for a human) or "open".
export const statusOf = (c) => (c.resolved ? "resolved" : c.escalated ? "escalated" : "open");

// Real numbers only: everything is derived from conversations held in this browser session.
export function summarize(conversations) {
  const total = conversations.length;
  const resolved = conversations.filter((c) => c.resolved).length;
  const escalated = conversations.filter((c) => statusOf(c) === "escalated").length;
  const firstReplies = conversations.map((c) => c.replyTimes[0]).filter((n) => n != null);
  return {
    total,
    open: total - resolved,
    escalated,
    resolved,
    avgFirstResponse: firstReplies.length ? Math.round(firstReplies.reduce((a, b) => a + b, 0) / firstReplies.length) : null,
    resolutionRate: total ? Math.round((resolved / total) * 100) : null,
  };
}

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [pending, setPending] = useState({}); // conversation id -> waiting for a reply
  const [health, setHealth] = useState("unknown"); // "unknown" | "ok" | "error", from real requests
  const pendingRef = useRef(new Set());
  const sessionStart = useRef(Date.now());

  const patch = useCallback((id, fn) => {
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const request = useCallback(async (id, query) => {
    pendingRef.current.add(id);
    setPending((p) => ({ ...p, [id]: true }));
    const started = performance.now();
    try {
      const reply = await askSupport(query);
      const ms = Math.round(performance.now() - started);
      const at = Date.now();
      patch(id, (c) => ({
        ...c,
        updatedAt: at,
        failedQuery: null,
        escalated: c.escalated || Boolean(reply.escalated),
        issueType: reply.issueType || c.issueType,
        replyTimes: [...c.replyTimes, ms],
        messages: [...c.messages, { id: nextId(), role: "ai", at, ...reply }],
      }));
      setHealth("ok");
    } catch (err) {
      const at = Date.now();
      patch(id, (c) => ({
        ...c,
        updatedAt: at,
        failedQuery: query,
        messages: [...c.messages, { id: nextId(), role: "ai", error: true, text: err.message, at }],
      }));
      setHealth("error");
    } finally {
      pendingRef.current.delete(id);
      setPending((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  }, [patch]);

  // Sends a customer message. Pass id = null to start a new conversation. Returns the conversation id, or null if nothing was sent.
  const send = useCallback((id, text, attachment) => {
    const clean = text.trim();
    if (!clean || (id && pendingRef.current.has(id))) return null;
    const at = Date.now();
    const userMsg = { id: nextId(), role: "user", text: clean, attachment, at };
    let convId = id;

    if (!convId) {
      convId = `c${at}-${counter++}`;
      const subject = clean.replace(/\s+/g, " ");
      setConversations((list) => [{
        id: convId,
        subject: subject.length > 70 ? `${subject.slice(0, 67)}…` : subject,
        resolved: false,
        escalated: false,
        issueType: null,
        createdAt: at,
        updatedAt: at,
        replyTimes: [],
        failedQuery: null,
        messages: [welcomeMessage(at), userMsg],
      }, ...list]);
    } else {
      patch(convId, (c) => ({ ...c, resolved: false, updatedAt: at, messages: [...c.messages, userMsg] }));
    }
    request(convId, clean);
    return convId;
  }, [patch, request]);

  const retry = useCallback((id, query) => {
    if (!query || pendingRef.current.has(id)) return;
    patch(id, (c) => ({ ...c, failedQuery: null, messages: c.messages.filter((m) => !m.error) }));
    request(id, query);
  }, [patch, request]);

  // Resolve / reopen only change this session's view. The backend has no endpoint for it.
  const setResolved = useCallback((id, resolved) => {
    patch(id, (c) => ({ ...c, resolved, updatedAt: Date.now() }));
  }, [patch]);

  return { conversations, pending, health, sessionStart: sessionStart.current, send, retry, setResolved };
}
