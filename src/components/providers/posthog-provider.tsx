"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { getConsentOrDefault } from "@/lib/cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const consent = getConsentOrDefault();

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      persistence: consent.analytics ? "cookie" : "memory",
      opt_out_capturing_by_default: !consent.analytics,
    });

    if (consent.analytics) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }

    initialized.current = true;
  }, []);

  useEffect(() => {
    function handleConsentChange(e: Event) {
      const detail = (e as CustomEvent).detail as { analytics: boolean };
      if (detail.analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }

    window.addEventListener("cookie-consent-change", handleConsentChange);
    return () => window.removeEventListener("cookie-consent-change", handleConsentChange);
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
