'use client';

import { useActionState, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { signInAction, signUpAction } from '@/app/actions';
import {
  AUTH_FORM_INITIAL_STATE,
  type AuthFormFieldErrors,
  type AuthFormState,
} from '@/lib/auth/form-state';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/rules';

type AuthMode = 'signin' | 'signup';

const INPUT_CLASS_NAME =
  'w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent/50';
const ERRORED_INPUT_CLASS_NAME = 'border-red-500/60 focus:border-red-500';
const SUBMIT_CLASS_NAME =
  'mt-1 flex w-full items-center justify-center rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
    >
      {message}
    </p>
  );
}

function AuthForm({
  action,
  mode,
  defaultEmail,
  onSwitchMode,
}: {
  action: (previousState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  mode: AuthMode;
  defaultEmail: string | null;
  onSwitchMode: (mode: AuthMode) => void;
}) {
  const [state, formAction, isPending] = useActionState(action, AUTH_FORM_INITIAL_STATE);
  const fieldErrors: AuthFormFieldErrors = state.fieldErrors ?? {};
  const isSignUp = mode === 'signup';

  return (
    <form action={formAction} className="mt-6 text-left" noValidate>
      <label htmlFor={`${mode}-email`} className="block text-sm font-medium text-ink">
        Email
      </label>
      <input
        id={`${mode}-email`}
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaultEmail ?? ''}
        placeholder="you@example.com"
        aria-invalid={Boolean(fieldErrors.email)}
        className={`mt-1.5 ${INPUT_CLASS_NAME} ${fieldErrors.email ? ERRORED_INPUT_CLASS_NAME : ''}`}
      />
      <FieldError message={fieldErrors.email} />

      <label
        htmlFor={`${mode}-password`}
        className="mt-4 block text-sm font-medium text-ink"
      >
        Password
      </label>
      <input
        id={`${mode}-password`}
        name="password"
        type="password"
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        placeholder={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : '••••••••'}
        aria-invalid={Boolean(fieldErrors.password)}
        className={`mt-1.5 ${INPUT_CLASS_NAME} ${fieldErrors.password ? ERRORED_INPUT_CLASS_NAME : ''}`}
      />
      <FieldError message={fieldErrors.password} />

      {isSignUp ? (
        <>
          <label
            htmlFor="signup-confirm-password"
            className="mt-4 block text-sm font-medium text-ink"
          >
            Confirm password
          </label>
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className={`mt-1.5 ${INPUT_CLASS_NAME} ${fieldErrors.confirmPassword ? ERRORED_INPUT_CLASS_NAME : ''}`}
          />
          <FieldError message={fieldErrors.confirmPassword} />
        </>
      ) : null}

      <button type="submit" disabled={isPending} className={SUBMIT_CLASS_NAME}>
        {isPending
          ? isSignUp
            ? 'Creating account…'
            : 'Signing in…'
          : isSignUp
            ? 'Create account'
            : 'Sign in'}
      </button>

      <FormError message={state.error} />

      <p className="mt-4 text-center text-xs text-muted">
        {isSignUp ? 'Already have an account? ' : 'Need an account? '}
        <button
          type="button"
          onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </form>
  );
}

interface SignInGateProps {
  rememberedEmail: string | null;
}

export default function SignInGate({ rememberedEmail }: SignInGateProps) {
  const [mode, setMode] = useState<AuthMode>('signin');

  return (
    <main className="grid h-dvh w-full place-items-center overflow-y-auto bg-canvas px-6 py-12 font-sans text-ink antialiased">
      <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
          <MessageSquare size={22} />
        </span>

        <h1 className="mt-5 text-lg font-semibold text-ink">
          {mode === 'signin' ? 'Sign in to DeepAgent' : 'Create your DeepAgent account'}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {mode === 'signin'
            ? rememberedEmail
              ? 'Welcome back. Pick up your last conversation.'
              : 'Use your email and password to continue.'
            : 'Pick an email and a password to get started.'}
        </p>

        <AuthForm
          key={mode}
          action={mode === 'signin' ? signInAction : signUpAction}
          mode={mode}
          defaultEmail={mode === 'signin' ? rememberedEmail : null}
          onSwitchMode={setMode}
        />

        <p className="mt-4 text-xs text-muted">
          Your email is only used to identify your account.
        </p>
      </div>
    </main>
  );
}
