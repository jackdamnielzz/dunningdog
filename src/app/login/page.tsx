import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import { AuthPageLayout } from "@/components/layouts/auth-page-layout";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import { readParam } from "@/lib/params";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
    <AuthPageLayout>
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
              className="font-medium text-accent-700 hover:text-accent-600"
            >
              Try for Free
            </Link>
            {" "}— 7-day trial, no credit card required.
          </p>
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
