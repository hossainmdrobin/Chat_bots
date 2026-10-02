'use client';

import React, { useEffect, useState } from 'react';

const BUTTON_CLASS_NAME =
  'flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm font-medium text-ink transition hover:border-accent/50 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60';

interface AuthActionFormProps {
  action: 'signout';
  className?: string;
  buttonClassName?: string;
  children: React.ReactNode;
}

export default function AuthActionForm({
  action,
  className = '',
  buttonClassName = BUTTON_CLASS_NAME,
  children
}: AuthActionFormProps) {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/api/auth/csrf', { credentials: 'same-origin' })
      .then((response) => response.json())
      .then((data: { csrfToken?: string }) => {
        if (active && data?.csrfToken) setCsrfToken(data.csrfToken);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <form action={`/api/auth/${action}`} method="post" className={className}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value="/" />
      <button
        type="submit"
        disabled={!csrfToken}
        className={buttonClassName}
      >
        {children}
      </button>
    </form>
  );
}
