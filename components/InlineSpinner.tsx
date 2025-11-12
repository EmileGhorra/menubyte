export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      {label && <span>{label}</span>}
    </span>
  );
}
