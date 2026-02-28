import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = readParam(params, "next") ?? "/app";
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,#d9f5ee_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e2f4ff_0%,transparent_28%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)] px-4 py-12 sm:px-6 sm:py-16">
      <main className="mx-auto flex w-full flex-col gap-6" style={{ maxWidth: 460 }}>
        <Link href="/" className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          DunningDog
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Sign in with your DunningDog account to access your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm nextPath={nextPath} />
            <p className="text-sm text-zinc-600">
              No account yet?{" "}
              <Link
                href={`/register?next=${encodeURIComponent(nextPath)}`}
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                Create one
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
