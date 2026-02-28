"use client";

import { useState } from "react";

interface PaymentUpdateFormProps {
  token: string;
  accentColor: string;
}

export function PaymentUpdateForm({ token, accentColor }: PaymentUpdateFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/customer/setup-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to create payment session.");
      }

      const { portalUrl } = await response.json();
      if (portalUrl) {
        window.location.href = portalUrl;
        return;
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">Payment method updated</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Your subscription is now active. You can close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">
        Click below to securely update your payment method via Stripe.
      </p>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {status === "loading" ? "Redirecting..." : "Update payment method"}
      </button>
      {status === "error" && errorMessage && (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
