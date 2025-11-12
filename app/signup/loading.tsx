import { Spinner } from '@/components/Spinner';

export default function SignupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <Spinner label="Opening signup…" />
    </div>
  );
}
