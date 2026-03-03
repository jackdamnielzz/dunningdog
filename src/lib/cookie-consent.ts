/**
 * Cookie consent preferences stored in localStorage.
 *
 * - `essential` is always true (cannot be disabled).
 * - `analytics` controls PostHog.
 * - `errorTracking` controls Sentry session replay / performance tracing.
 */

const STORAGE_KEY = "dd-cookie-consent";

export interface CookieConsent {
  analytics: boolean;
  errorTracking: boolean;
}

const DEFAULT_CONSENT: CookieConsent = {
  analytics: false,
  errorTracking: false,
};

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return {
      analytics: parsed.analytics === true,
      errorTracking: parsed.errorTracking === true,
    };
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: consent }));
}

export function hasRespondedToConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function getConsentOrDefault(): CookieConsent {
  return getCookieConsent() ?? DEFAULT_CONSENT;
}
