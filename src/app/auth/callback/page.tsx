import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthCallbackClient } from "@/components/forms/oauth-callback-client";

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,#d9f5ee_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e2f4ff_0%,transparent_28%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)] px-4 py-12 sm:px-6 sm:py-16">
      <main className="mx-auto flex w-full flex-col gap-6" style={{ maxWidth: 460 }}>
        <Link href="/" className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          DunningDog
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Signing you in</CardTitle>
            <CardDescription>
              We are validating your Google or Microsoft sign-in response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OAuthCallbackClient />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

