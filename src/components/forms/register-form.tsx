"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Divider } from "@/components/ui/divider";
import { SocialAuthButtons } from "@/components/forms/social-auth-buttons";
import { normalizeNextPath } from "@/lib/safe-redirect";

interface RegisterFormProps {
  nextPath: string;
}

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const nextTarget = normalizeNextPath(nextPath);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setConfirmationNotice(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          next: nextTarget,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
        next?: string;
        authenticated?: boolean;
        requiresEmailConfirmation?: boolean;
      };

      if (!response.ok) {
        setErrorMessage(payload.detail ?? "Registration failed. Try again.");
        return;
      }

      if (payload.authenticated) {
        window.gtag?.("event", "form_submit");
        router.push(payload.next ?? nextTarget);
        router.refresh();
        return;
      }

      if (payload.requiresEmailConfirmation) {
        window.gtag?.("event", "form_submit");
        setConfirmationNotice(
          "Account created. Check your inbox to confirm your email, then sign in.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Confirm password</Label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      {confirmationNotice ? (
        <Alert variant="success">
          {confirmationNotice}{" "}
          <Link href={`/login?next=${encodeURIComponent(nextTarget)}`} className="font-semibold underline">
            Go to sign in
          </Link>
          .
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>

      <Divider />

      <SocialAuthButtons nextPath={nextTarget} />
    </form>
  );
}
