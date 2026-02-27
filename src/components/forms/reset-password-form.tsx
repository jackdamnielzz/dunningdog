"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function readAccessTokenFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const hashToken = hashParams.get("access_token");
  if (hashToken) {
    return hashToken;
  }

  const queryToken = new URLSearchParams(window.location.search).get("access_token");
  return queryToken;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = readAccessTokenFromUrl();
    setAccessToken(token);

    if (token && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const hasValidToken = useMemo(() => Boolean(accessToken && accessToken.length > 20), [accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!hasValidToken || !accessToken) {
      setErrorMessage("Reset link is invalid or expired. Request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
        next?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.detail ?? "Could not reset password. Request a new link.");
        return;
      }

      router.push(payload.next ?? "/app");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-confirm-password">Confirm new password</Label>
        <Input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {!hasValidToken ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No valid reset token found. Request a new reset link first.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending || !hasValidToken}>
        {pending ? "Updating password..." : "Update password"}
      </Button>

      <p className="text-sm text-zinc-600">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-emerald-700 hover:text-emerald-600"
        >
          Request reset email
        </Link>
        .
      </p>
    </form>
  );
}

