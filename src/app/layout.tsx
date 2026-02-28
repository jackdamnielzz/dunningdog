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
  title: "DunningDog",
  description:
    "Recover failed subscription payments with automated pre-dunning, smart sequences, and clear ROI metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${plexMono.variable} ${roboto.variable} antialiased`}>
        <DevServiceWorkerReset />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
