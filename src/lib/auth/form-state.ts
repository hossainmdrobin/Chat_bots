export interface AuthFormFieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthFormState {
  error?: string;
  fieldErrors?: AuthFormFieldErrors;
}

export const AUTH_FORM_INITIAL_STATE: AuthFormState = {};
