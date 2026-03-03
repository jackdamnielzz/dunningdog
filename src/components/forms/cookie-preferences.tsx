"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CookieConsent,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookie-consent";
import { Button } from "@/components/ui/button";

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
        ${enabled ? "bg-accent-600" : "bg-zinc-300"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
          transition duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

export function CookiePreferences() {
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    errorTracking: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getCookieConsent();
    if (stored) setConsent(stored);
  }, []);

  const handleSave = useCallback(() => {
    setCookieConsent(consent);
    setSaved(true);

    // Reload to apply changes (PostHog/Sentry check consent on init)
    setTimeout(() => window.location.reload(), 800);
  }, [consent]);

  const handleAcceptAll = useCallback(() => {
    const all: CookieConsent = { analytics: true, errorTracking: true };
    setConsent(all);
    setCookieConsent(all);
    setSaved(true);
    setTimeout(() => window.location.reload(), 800);
  }, []);

  const handleRejectAll = useCallback(() => {
    const none: CookieConsent = { analytics: false, errorTracking: false };
    setConsent(none);
    setCookieConsent(none);
    setSaved(true);
    setTimeout(() => window.location.reload(), 800);
  }, []);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <h3 className="text-base font-semibold text-zinc-900">
        Cookie Preferences
      </h3>
      <p className="mt-1 text-sm text-zinc-600">
        Manage which cookies DunningDog is allowed to use. Essential cookies
        cannot be disabled as they are required for the service to function.
      </p>

      <div className="mt-5 space-y-4">
        {/* Essential — always on */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">
              Essential Cookies
            </p>
            <p className="text-xs text-zinc-500">
              Required for authentication, session management, and security.
              These cannot be disabled.
            </p>
          </div>
          <Toggle enabled disabled onChange={() => {}} />
        </div>

        {/* Analytics */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">
              Analytics Cookies
            </p>
            <p className="text-xs text-zinc-500">
              Help us understand how the product is used and improve the
              experience. Powered by PostHog.
            </p>
          </div>
          <Toggle
            enabled={consent.analytics}
            onChange={(v) => {
              setConsent((prev) => ({ ...prev, analytics: v }));
              setSaved(false);
            }}
          />
        </div>

        {/* Error tracking */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">
              Error Tracking Cookies
            </p>
            <p className="text-xs text-zinc-500">
              Help us detect and fix bugs quickly. Powered by Sentry.
            </p>
          </div>
          <Toggle
            enabled={consent.errorTracking}
            onChange={(v) => {
              setConsent((prev) => ({ ...prev, errorTracking: v }));
              setSaved(false);
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={handleSave}>
          {saved ? "Saved — reloading…" : "Save preferences"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleAcceptAll}>
          Accept all
        </Button>
        <Button size="sm" variant="outline" onClick={handleRejectAll}>
          Reject all
        </Button>
      </div>
    </div>
  );
}
