import PageHeader from "../components/PageHeader.jsx";
import { Dot } from "../components/StatusBadge.jsx";
import { API_ENDPOINT, IS_MOCK } from "../api.js";

function Row({ label, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-muted">{children}</dd>
    </div>
  );
}

export default function Settings({ system }) {
  return (
    <>
      <PageHeader title="Settings" description="How this app connects to the support assistant." />

      <div className="mt-6 space-y-4">
        <section className="card p-4" aria-labelledby="conn-heading">
          <h2 id="conn-heading" className="text-sm font-semibold">Assistant connection</h2>
          <dl className="mt-1 divide-y divide-line">
            <Row label="Mode">{IS_MOCK ? "Demo replies (no backend configured)" : "Live API"}</Row>
            <Row label="Endpoint">{IS_MOCK ? "Not configured" : <span className="font-mono text-xs">{API_ENDPOINT}</span>}</Row>
            <Row label="Status">
              <span className="inline-flex items-center gap-2 text-ink"><Dot tone={system.tone} /> {system.label}</span>
              <span className="ml-2">{system.detail}</span>
            </Row>
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
            The endpoint is set with <code className="font-mono">VITE_API_URL</code> in your <code className="font-mono">.env</code> file. Restart the dev server after changing it.
          </p>
        </section>

        <section className="card p-4" aria-labelledby="data-heading">
          <h2 id="data-heading" className="text-sm font-semibold">Session data</h2>
          <p className="mt-2 text-sm text-muted">
            Conversations and metrics are kept in this browser tab only. Marking a conversation resolved is not sent to a server.
            Everything is cleared when the page is reloaded.
          </p>
        </section>
      </div>
    </>
  );
}
