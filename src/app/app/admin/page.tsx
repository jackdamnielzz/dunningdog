import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { resolveWorkspaceContextFromHeaders, ensureWorkspaceExists } from "@/lib/auth";
import { AdminPlanSwitcher } from "@/components/forms/admin-plan-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const adminAccess = await isAdmin(requestHeaders);

  if (!adminAccess) {
    redirect("/app");
  }

  const workspace = await resolveWorkspaceContextFromHeaders(requestHeaders);
  const workspaceRecord = await ensureWorkspaceExists(workspace.workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Admin Panel</h1>
          <Badge variant="danger">Admin only</Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-600">
          Switch billing plans to test feature gating. Changes take effect immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Info</CardTitle>
          <CardDescription>Current workspace details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-700">
          <p>
            Workspace ID: <span className="font-mono text-xs">{workspaceRecord.id}</span>
          </p>
          <p>
            Name: <span className="font-medium">{workspaceRecord.name}</span>
          </p>
          <p>
            Current plan:{" "}
            <Badge variant="neutral" className="uppercase">
              {workspaceRecord.billingPlan}
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch Billing Plan</CardTitle>
          <CardDescription>
            Change the billing plan for this workspace. This bypasses Stripe checkout and updates the plan directly in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminPlanSwitcher
            workspaceId={workspaceRecord.id}
            currentPlan={workspaceRecord.billingPlan}
          />
        </CardContent>
      </Card>
    </div>
  );
}
