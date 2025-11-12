import { Spinner } from '@/components/Spinner';

export default function MenuIndexLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <Spinner label="Loading menus…" />
    </div>
  );
}
