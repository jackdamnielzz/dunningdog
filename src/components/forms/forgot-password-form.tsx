"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
        message?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.detail ?? "Could not send reset email. Try again.");
        return;
      }

      setSuccessMessage(
        payload.message ??
          "If an account exists for this email, a password reset link has been sent.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending link..." : "Send reset link"}
      </Button>

      <p className="text-sm text-zinc-600">
        Back to{" "}
        <Link href="/login" className="font-medium text-accent-700 hover:text-accent-600">
          sign in
        </Link>
        .
      </p>
    </form>
  );
}

