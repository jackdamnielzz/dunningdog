"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { normalizeNextPath } from "@/lib/safe-redirect";

type CallbackState = "loading" | "error";

function readHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function readInteger(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function OAuthCallbackClient() {
  const [state, setState] = useState<CallbackState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeOAuth() {
      const query = new URLSearchParams(window.location.search);
      const hashParams = readHashParams();
      const nextPath = normalizeNextPath(query.get("next"));

      const providerError =
        hashParams.get("error_description") ??
        query.get("error_description") ??
        hashParams.get("error") ??
        query.get("error");
      if (providerError) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage(providerError);
        return;
      }

      // Read app_state first (DunningDog's own state), then Supabase's state as fallback
      const appState =
        hashParams.get("app_state") ??
        query.get("app_state") ??
        hashParams.get("state") ??
        query.get("state");
      if (!appState) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage("Missing OAuth state. Please start sign-in again.");
        return;
      }

      // Detect PKCE flow (code in query) vs implicit flow (access_token in hash)
      const code = query.get("code");
      const accessToken = hashParams.get("access_token") ?? query.get("access_token");

      let body: Record<string, unknown>;

      if (code) {
        // PKCE flow: send code to server for exchange
        body = { code, state: appState, next: nextPath };
      } else if (accessToken) {
        // Implicit flow (legacy fallback)
        const refreshToken = hashParams.get("refresh_token") ?? query.get("refresh_token");
        const expiresIn = readInteger(hashParams.get("expires_in") ?? query.get("expires_in"));
        body = {
          accessToken,
          refreshToken: refreshToken ?? undefined,
          expiresIn,
          next: nextPath,
          state: appState,
        };
      } else {
        if (!isMounted) return;
        setState("error");
        setErrorMessage("No authorization code or access token found in OAuth callback response.");
        return;
      }

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
        next?: string;
      };

      if (!response.ok) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage(payload.detail ?? "Could not create a session from OAuth response.");
        return;
      }

      // Use full page navigation instead of Next.js client-side routing.
      // This ensures cookies set by the session endpoint are fully committed
      // before the server-side auth guard runs on the target page.
      window.location.assign(payload.next ?? nextPath);
    }

    void completeOAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <p className="rounded-md border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-800">
        Finishing sign-in...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {errorMessage ?? "OAuth sign-in failed. Please try again."}
      </p>
      <p className="text-sm text-zinc-600">
        Return to{" "}
        <Link href="/login" className="font-medium text-accent-700 hover:text-accent-600">
          sign in
        </Link>
        .
      </p>
    </div>
  );
}
