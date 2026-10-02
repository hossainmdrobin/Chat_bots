'use client';

import React, { useEffect, useState } from 'react';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.56-5.15 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

const BUTTON_CLASS_NAME =
  'flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm font-medium text-ink transition hover:border-accent/50 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60';

interface AuthActionFormProps {
  action: 'signin' | 'signout';
  provider?: string;
  className?: string;
  buttonClassName?: string;
  children: React.ReactNode;
}

export default function AuthActionForm({
  action,
  provider,
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

  const target = provider ? `/api/auth/${action}/${provider}` : `/api/auth/${action}`;

  return (
    <form action={target} method="post" className={className}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value="/" />
      <button
        type="submit"
        disabled={!csrfToken}
        className={buttonClassName}
      >
        {action === 'signin' ? <GoogleMark /> : null}
        {children}
      </button>
    </form>
  );
}