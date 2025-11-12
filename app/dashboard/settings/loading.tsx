import { Spinner } from '@/components/Spinner';

export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <Spinner label="Loading settings…" />
    </div>
  );
}
