'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface Props {
  className?: string;
}

export function LogoutButton({ className }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: '/login' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark/90 ${
        className ?? ''
      } ${isLoading ? 'opacity-70' : ''}`.trim()}
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Log out'}
    </button>
  );
}
