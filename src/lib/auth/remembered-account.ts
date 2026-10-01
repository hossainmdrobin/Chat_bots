export const REMEMBERED_ACCOUNT_COOKIE = "remembered_google_account";

const ONE_HALF_YEARS_IN_SECONDS = 60 * 60 * 24 * 180;

/**
 * Client-only hint used to pre-fill the sign-in button label.
 * It carries no authority: access is always decided by the Auth.js session.
 */
export function rememberAccount(email: string) {
  document.cookie = `${REMEMBERED_ACCOUNT_COOKIE}=${encodeURIComponent(
    email
  )}; path=/; max-age=${ONE_HALF_YEARS_IN_SECONDS}; samesite=lax`;
}

export function readRememberedAccount(value: string | undefined) {
  if (!value) return null;
  const decoded = decodeURIComponent(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded) ? decoded : null;
}