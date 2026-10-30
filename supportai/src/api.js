// Backend endpoint comes from .env (VITE_API_URL). Empty value = mock replies.
const API_URL = (import.meta.env.VITE_API_URL || "").trim();
export const IS_MOCK = !API_URL;
// Safe-to-display endpoint (no query string), used on the Settings page.
export const API_ENDPOINT = (() => {
  try { const u = new URL(API_URL); return u.origin + u.pathname; } catch { return API_URL; }
})();

export class ApiError extends Error {}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function mockReply(query) {
  const q = query.toLowerCase();
  if (/(track|order|parcel|deliver|shipment)/.test(q))
    return "I can check that for you. Please share your order ID (for example ORD1001) and I'll look up the latest status.";
  if (/(bill|payment|charge|invoice|refund)/.test(q))
    return "Happy to help with billing. Tell me your order ID and what went wrong, such as a failed payment or a duplicate charge, and I'll review it.";
  if (/(agent|human|person|representative)/.test(q))
    return "I can hand this over to a human agent. Please describe the problem in one or two lines so the team has the context.";
  return "Thanks for reaching out. Could you share a few more details, such as your order ID and what you need help with?";
}

export async function askSupport(query) {
  if (IS_MOCK) {
    await wait(1000 + Math.random() * 700);
    // The mock mirrors the real API: asking for a human flags the reply for escalation.
    return { text: mockReply(query), escalated: /(agent|human|person|representative)/i.test(query) };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = "";
      try {
        const body = await res.json();
        message = body?.detail?.message || "";
      } catch { /* body was not JSON */ }
      if (!message) {
        message = res.status === 429
          ? "Too many requests right now. Please wait a moment and try again."
          : "The assistant is having trouble right now. Please try again shortly.";
      }
      throw new ApiError(message);
    }

    const data = await res.json();
    const text = typeof data === "string" ? data : data.response ?? data.message ?? "";
    if (!text) throw new ApiError("The assistant sent an empty reply. Please try again.");
    return {
      text,
      escalated: Boolean(data.escalation_required),
      issueType: data.issue_type,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") throw new ApiError("The assistant took too long to respond. Please try again.");
    throw new ApiError("We can't reach the support assistant. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}
