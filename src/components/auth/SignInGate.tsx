import { MessageSquare } from 'lucide-react';
import AuthActionForm from './AuthActionForm';

interface SignInGateProps {
  rememberedEmail: string | null;
}

export default function SignInGate({ rememberedEmail }: SignInGateProps) {
  return (
    <main className="grid h-dvh w-full place-items-center overflow-y-auto bg-canvas px-6 py-12 font-sans text-ink antialiased">
      <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
          <MessageSquare size={22} />
        </span>

        <h1 className="mt-5 text-lg font-semibold text-ink">Sign in to DeepAgent</h1>
        <p className="mt-1.5 text-sm text-muted">
          {rememberedEmail
            ? 'Welcome back. Pick up your last conversation.'
            : 'Use your Google account to continue.'}
        </p>

        <div className="mt-6">
          <AuthActionForm action="signin" provider="google">
            {rememberedEmail ? `Continue as ${rememberedEmail}` : 'Continue with Google'}
          </AuthActionForm>
        </div>

        <p className="mt-4 text-xs text-muted">
          {rememberedEmail
            ? 'Pick a different account on the Google sign-in screen.'
            : 'Your email is only used to identify your account.'}
        </p>
      </div>
    </main>
  );
}