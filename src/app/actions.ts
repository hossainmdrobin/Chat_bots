"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  createAccount,
  EmailAlreadyRegisteredError,
  isEmailRegistered,
  normalizeEmail,
} from "@/lib/auth/credentials";
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from "@/lib/auth/rules";
import type { AuthFormFieldErrors, AuthFormState } from "@/lib/auth/form-state";

const INVALID_CREDENTIALS_MESSAGE = "That email and password combination is not recognised.";
const EMAIL_TAKEN_MESSAGE = "An account already exists for that email. Sign in instead.";

/**
 * Signs in an existing account and establishes the Auth.js session cookie.
 * Resolves to a form state on failure and redirects to the app on success.
 */
export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const fieldErrors: AuthFormFieldErrors = {};

  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password) fieldErrors.password = "Enter your password.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: INVALID_CREDENTIALS_MESSAGE };
    throw error;
  }

  redirect("/");
}

/**
 * Registers a new local account and immediately signs it in.
 */
export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: AuthFormFieldErrors = {};

  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (confirmPassword !== password) fieldErrors.confirmPassword = "Passwords do not match.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  if (await isEmailRegistered(email)) return { error: EMAIL_TAKEN_MESSAGE };

  try {
    await createAccount({ email, password });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) return { error: EMAIL_TAKEN_MESSAGE };
    throw error;
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but we could not sign you in. Please sign in." };
    }
    throw error;
  }

  redirect("/");
}
