import { PrismaClient } from "@prisma/client";

type StepResult = {
  step: string;
  ok: boolean;
  status?: number;
  detail: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for smoke run.`);
  }
  return value;
}

async function parseJsonSafe(response: Response) {
  return response.json().catch(() => null);
}

async function run() {
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const cronSecret = requiredEnv("CRON_SECRET");
  const skipDb = process.env.SKIP_DB === "true" || !process.env.DATABASE_URL;
  const results: StepResult[] = [];

  let db: PrismaClient | null = null;
  try {
    let attemptId = process.env.RECOVERY_ATTEMPT_ID;

    if (!attemptId && !skipDb) {
      db = new PrismaClient();
      const latest = await db.recoveryAttempt.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      attemptId = latest?.id;
    }

    if (!attemptId && skipDb) {
      results.push({
        step: "step10",
        ok: true,
        detail: "Skipped (no DB access and no RECOVERY_ATTEMPT_ID set).",
      });
    } else if (!attemptId) {
      results.push({
        step: "step10",
        ok: false,
        detail: "No recovery attempts found. Set RECOVERY_ATTEMPT_ID or create one first.",
      });
    } else {
      const paymentResponse = await fetch(`${appBaseUrl}/api/customer/update-payment-session`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recoveryToken: `attempt:${attemptId}`,
        }),
      });

      const paymentPayload = (await parseJsonSafe(paymentResponse)) as
        | { sessionUrl?: unknown; expiresAt?: unknown; detail?: string }
        | null;

      const validPayload =
        paymentResponse.ok &&
        typeof paymentPayload?.sessionUrl === "string" &&
        typeof paymentPayload?.expiresAt === "string";

      results.push({
        step: "step10",
        ok: validPayload,
        status: paymentResponse.status,
        detail: validPayload
          ? `Payment update endpoint returned a valid session for attempt ${attemptId}.`
          : `Expected 200 with sessionUrl+expiresAt. Received detail: ${paymentPayload?.detail ?? "n/a"}.`,
      });
    }

    const preDunningResponse = await fetch(`${appBaseUrl}/api/cron/pre-dunning`, {
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    });
    const preDunningPayload = (await parseJsonSafe(preDunningResponse)) as
      | { executed?: unknown; workspaces?: unknown; candidates?: unknown; detail?: string }
      | null;
    const preDunningValid =
      preDunningResponse.ok &&
      typeof preDunningPayload?.executed === "boolean" &&
      typeof preDunningPayload?.workspaces === "number" &&
      typeof preDunningPayload?.candidates === "number";
    results.push({
      step: "step11-pre-dunning",
      ok: preDunningValid,
      status: preDunningResponse.status,
      detail: preDunningValid
        ? "Pre-dunning cron endpoint returned expected shape."
        : `Unexpected response: ${preDunningPayload?.detail ?? "n/a"}.`,
    });

    const metricResponse = await fetch(`${appBaseUrl}/api/cron/metric-snapshots`, {
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    });
    const metricPayload = (await parseJsonSafe(metricResponse)) as
      | { executed?: unknown; count?: unknown; snapshots?: unknown; detail?: string }
      | null;
    const metricValid =
      metricResponse.ok &&
      typeof metricPayload?.executed === "boolean" &&
      typeof metricPayload?.count === "number" &&
      Array.isArray(metricPayload?.snapshots);
    results.push({
      step: "step11-metric-snapshots",
      ok: metricValid,
      status: metricResponse.status,
      detail: metricValid
        ? "Metric snapshot cron endpoint returned expected shape."
        : `Unexpected response: ${metricPayload?.detail ?? "n/a"}.`,
    });
  } finally {
    if (db) await db.$disconnect();
  }

  const failed = results.filter((result) => !result.ok);

  console.log("\nRunbook 6 Smoke Results");
  console.log("=======================");
  for (const result of results) {
    const statusText = typeof result.status === "number" ? ` (status ${result.status})` : "";
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.step}${statusText}`);
    console.log(`- ${result.detail}`);
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("Smoke script failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});

