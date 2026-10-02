import { EMAIL_PATTERN } from "./rules";

export const REMEMBERED_ACCOUNT_COOKIE = "remembered_account";

const ONE_HALF_YEARS_IN_SECONDS = 60 * 60 * 24 * 180;

/**
 * Client-only hint used to pre-fill the sign-in email field.
 * It carries no authority: access is always decided by the Auth.js session.
 */
export function rememberAccount(email: string) {
  document.cookie = `${REMEMBERED_ACCOUNT_COOKIE}=${encodeURIComponent(
    email
  )}; path=/; max-age=${ONE_HALF_YEARS_IN_SECONDS}; samesite=lax`;
}

export function readRememberedAccount(value: string | undefined) {
  if (!value) return null;

  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }

  return EMAIL_PATTERN.test(decoded) ? decoded : null;
}
