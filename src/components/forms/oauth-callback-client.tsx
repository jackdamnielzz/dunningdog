"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CallbackState = "loading" | "error";

function normalizeNextPath(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }
  return path;
}

function readHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

export function OAuthCallbackClient() {
  const router = useRouter();
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

      const accessToken = hashParams.get("access_token") ?? query.get("access_token");
      if (!accessToken) {
        if (!isMounted) return;
        setState("error");
        setErrorMessage("No access token found in OAuth callback response.");
        return;
      }

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          next: nextPath,
        }),
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

      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      router.replace(payload.next ?? nextPath);
      router.refresh();
    }

    void completeOAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (state === "loading") {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
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
        <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-600">
          sign in
        </Link>
        .
      </p>
    </div>
  );
}

