import { Spinner } from '@/components/Spinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light px-4">
      <Spinner label="Preparing MenuByte…" />
    </div>
  );
}
