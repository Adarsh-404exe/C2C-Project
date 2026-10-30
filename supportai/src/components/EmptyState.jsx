export default function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
