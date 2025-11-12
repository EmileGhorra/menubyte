import { Spinner } from '@/components/Spinner';

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light">
      <Spinner label="Preparing onboarding…" />
    </div>
  );
}
