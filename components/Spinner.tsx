// NOTE: Central spinner used by route-level loading boundaries and client components.
export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      <span>{label}</span>
    </div>
  );
}
