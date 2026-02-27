import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";

interface RegisterPageProps {
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

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = readParam(params, "next") ?? "/app";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,#d9f5ee_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e2f4ff_0%,transparent_28%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)] px-4 py-12 sm:px-6 sm:py-16">
      <main className="mx-auto flex w-full flex-col gap-6" style={{ maxWidth: 460 }}>
        <Link href="/" className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          DunningDog
        </Link>

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
                className="font-medium text-emerald-700 hover:text-emerald-600"
              >
                Sign in
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
