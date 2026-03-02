import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono, Roboto } from "next/font/google";
import { DevServiceWorkerReset } from "@/components/dev/dev-sw-reset";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DunningDog — Automated Payment Recovery for Stripe",
    template: "%s | DunningDog",
  },
  description:
    "Recover failed subscription payments with automated pre-dunning, smart sequences, and clear ROI metrics.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "https://dunningdog.com",
  ),
  openGraph: {
    title: "DunningDog — Automated Payment Recovery for Stripe",
    description:
      "Stop losing revenue to failed payments. DunningDog automates dunning with smart email sequences, pre-dunning alerts, and real-time recovery metrics.",
    siteName: "DunningDog",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DunningDog — Automated Payment Recovery for Stripe",
    description:
      "Stop losing revenue to failed payments. Automated dunning sequences, pre-dunning alerts, and recovery metrics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${plexMono.variable} ${roboto.variable} antialiased`} suppressHydrationWarning>
        <DevServiceWorkerReset />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
