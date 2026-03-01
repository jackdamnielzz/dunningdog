import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthPageLayout } from "@/components/layouts/auth-page-layout";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import { readParam } from "@/lib/params";

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Create your DunningDog account to start tracking recoveries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm nextPath={nextPath} />
          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="font-medium text-accent-700 hover:text-accent-600"
            >
              Sign in
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
