"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getConsentOrDefault } from "@/lib/cookie-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  useEffect(() => {
    function updateConsent() {
      const consent = getConsentOrDefault();
      window.gtag?.("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.analytics ? "granted" : "denied",
        ad_user_data: consent.analytics ? "granted" : "denied",
        ad_personalization: consent.analytics ? "granted" : "denied",
      });
    }

    updateConsent();
    window.addEventListener("cookie-consent-change", updateConsent);
    return () => window.removeEventListener("cookie-consent-change", updateConsent);
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500,
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          gtag('config', 'AW-640419421');
        `}
      </Script>
    </>
  );
}
