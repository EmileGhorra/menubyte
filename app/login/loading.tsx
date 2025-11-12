import { Spinner } from '@/components/Spinner';

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <Spinner label="Opening login…" />
    </div>
  );
}
