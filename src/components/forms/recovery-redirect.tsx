"use client";

import { useEffect } from "react";

/**
 * Detects Supabase recovery tokens in the URL hash and redirects to /reset-password.
 * Supabase sometimes strips the path from redirect_to, landing the user on the homepage
 * with #access_token=...&type=recovery. This component catches that and redirects.
 */
export function RecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    if (params.get("type") === "recovery" && params.get("access_token")) {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return null;
}
