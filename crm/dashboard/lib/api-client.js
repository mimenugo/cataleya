"use client";

import { createClient } from "./supabase/client.js";

const API_URL = process.env.NEXT_PUBLIC_CRM_API_URL;

export async function apiFetchClient(path, options = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error ${response.status} al llamar ${path}`);
  }

  return response.json();
}
