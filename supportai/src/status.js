import { IS_MOCK } from "./api.js";

// The assistant's status is only "known" after a real request. In demo mode there is nothing to check.
export function systemStatus(health) {
  if (IS_MOCK) return { label: "Demo mode", detail: "Replies are simulated", tone: "neutral" };
  if (health === "ok") return { label: "Assistant responding", detail: "Last request succeeded", tone: "ok" };
  if (health === "error") return { label: "Assistant not responding", detail: "Last request failed", tone: "bad" };
  return { label: "Not checked yet", detail: "Updates after the first reply", tone: "neutral" };
}
