'use client';

import { createClient } from './supabase/client';

export type AuthError = {
  message: string;
};

export type AuthResult = {
  error: AuthError | null;
};

/**
 * Sign up a new user with email and password (client-side)
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

/**
 * Sign in an existing user with email and password (client-side)
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

/**
 * Sign out the current user (client-side)
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

/**
 * Get the current user from the session (client-side)
 */
export async function getUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
