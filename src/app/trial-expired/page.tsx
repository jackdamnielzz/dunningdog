import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUserIdFromHeaders, resolveWorkspaceContextFromHeaders, ensureWorkspaceExists } from "@/lib/auth";
import { getTrialStatus, isWorkspaceAccessible } from "@/lib/trial";
import { PLAN_TIERS } from "@/lib/plans";
import { UpgradePlanButton } from "@/components/forms/upgrade-plan-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TrialExpiredPage() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (!userId) {
    redirect("/login?next=/app");
  }

  const workspaceContext = await resolveWorkspaceContextFromHeaders(requestHeaders);
  const workspace = await ensureWorkspaceExists(workspaceContext.workspaceId);
  const trialStatus = getTrialStatus(workspace);

  if (isWorkspaceAccessible(trialStatus)) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-accent-50 via-white to-accent-100 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-zinc-900">
          DunningDog
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Your free trial has ended</h1>
          <p className="mt-2 text-zinc-600">
            Choose a plan to continue recovering failed payments and protecting your revenue.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_TIERS.map((tier) => (
            <Card key={tier.id} className="text-left">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold text-zinc-900">
                  ${tier.monthly}<span className="text-base font-normal text-zinc-500">/mo</span>
                </p>
                <p className="text-xs text-zinc-500">{tier.cap}</p>
                <p className="text-sm text-zinc-600">{tier.description}</p>
                <UpgradePlanButton
                  workspaceId={workspaceContext.workspaceId}
                  plan={tier.id}
                  currentPlan={workspace.billingPlan}
                  billingStatus={workspace.billingStatus}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-zinc-500">
          Questions?{" "}
          <a href="mailto:info@dunningdog.com" className="text-accent-600 underline hover:text-accent-700">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
