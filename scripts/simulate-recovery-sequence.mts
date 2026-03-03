/**
 * Simulates the FULL Inngest recovery sequence locally.
 *
 * This script replicates the exact behavior of recoveryStartedFunction:
 *   1. Creates a recovery attempt in the database
 *   2. Loads (or creates) a dunning sequence with 3 steps
 *   3. For each step: generates a real payment token → renders branded HTML → sends real email via SMTP
 *   4. Logs every email in the EmailLog table
 *
 * Delays are shortened from hours to seconds for testing.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/simulate-recovery-sequence.mts <email> [delay-seconds]
 *
 * Examples:
 *   npx tsx --env-file=.env.local scripts/simulate-recovery-sequence.mts niels.maas@maasiso.nl
 *   npx tsx --env-file=.env.local scripts/simulate-recovery-sequence.mts niels.maas@maasiso.nl 10
 */

import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

// ── Config ──────────────────────────────────────────────────────────────────

const toEmail = process.argv[2];
const stepDelaySec = Number(process.argv[3] || 5);

if (!toEmail || !toEmail.includes("@")) {
  console.error("Usage: npx tsx --env-file=.env.local scripts/simulate-recovery-sequence.mts <email> [delay-seconds]");
  process.exit(1);
}

const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3001";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL || "info@dunningdog.com";

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

// ── Email template (mirrors src/lib/services/email-template.ts) ─────────

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderEmail(params: {
  subject: string;
  body: string;
  companyName: string;
  accentColor: string;
  paymentUpdateUrl: string;
}): string {
  const bodyHtml = escapeHtml(params.body).replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(params.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="height:4px;background-color:${params.accentColor};"></td></tr>
        <tr><td style="padding:28px 32px 0;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#18181b;">${escapeHtml(params.companyName)}</p>
        </td></tr>
        <tr><td style="padding:20px 32px 8px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">${bodyHtml}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="background-color:${params.accentColor};border-radius:6px;padding:12px 28px;">
              <a href="${escapeHtml(params.paymentUpdateUrl)}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">Update payment method</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">Sent by ${escapeHtml(params.companyName)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDelay(hours: number): string {
  if (hours === 0) return "immediate";
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

// ── Default sequence templates ──────────────────────────────────────────────

const DEFAULT_STEPS = [
  {
    stepOrder: 1,
    delayHours: 0,
    subject: "Action needed: update your payment details",
    body: "We were unable to process your recent payment.\n\nPlease update your payment method to avoid interruption to your subscription. Click the button below to securely update your card details.\n\nIf you have already resolved this, please disregard this email.",
  },
  {
    stepOrder: 2,
    delayHours: 72,
    subject: "Reminder: your payment is still pending",
    body: "Your subscription is still at risk because your payment could not be processed.\n\nThis is a friendly reminder to update your payment method. It only takes a moment, and it will keep your subscription active without interruption.\n\nClick the button below to update now.",
  },
  {
    stepOrder: 3,
    delayHours: 168,
    subject: "Final reminder before your access is affected",
    body: "We have been unable to process your payment after multiple attempts.\n\nThis is our final reminder. Please update your payment method now to keep your subscription active. If we do not receive payment, your access may be suspended.\n\nClick below to resolve this in under a minute.",
  },
];

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║     DunningDog — Full Recovery Sequence Simulation              ║");
  console.log("╠══════════════════════════════════════════════════════════════════╣");
  console.log(`║  To:        ${toEmail.padEnd(49)}║`);
  console.log(`║  Delay:     ${(`${stepDelaySec}s between steps (production: 0h/72h/168h)`).padEnd(49)}║`);
  console.log(`║  Base URL:  ${APP_BASE_URL.padEnd(49)}║`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  // ── 1. Find or create workspace ──

  let workspace = await prisma.workspace.findFirst({
    where: { name: "Test Recovery Workspace" },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Test Recovery Workspace",
        ownerUserId: "test-user-recovery-flow",
        timezone: "UTC",
        billingPlan: "starter",
        isActive: true,
      },
    });
  }
  console.log(`Workspace: ${workspace.id}\n`);

  // ── 2. Find or create dunning sequence ──

  let sequence = await prisma.dunningSequence.findFirst({
    where: { workspaceId: workspace.id, isEnabled: true },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });

  if (!sequence) {
    sequence = await prisma.dunningSequence.create({
      data: {
        workspaceId: workspace.id,
        name: "Default Recovery Sequence",
        isEnabled: true,
        steps: {
          create: DEFAULT_STEPS.map((s) => ({
            stepOrder: s.stepOrder,
            delayHours: s.delayHours,
            subjectTemplate: s.subject,
            bodyTemplate: s.body,
          })),
        },
      },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
    });
    console.log(`Created dunning sequence: ${sequence.id} (${sequence.steps.length} steps)\n`);
  } else {
    console.log(`Using existing sequence: ${sequence.id} (${sequence.steps.length} steps)\n`);
  }

  // ── 3. Create recovery attempt ──

  const invoiceId = `in_sim_${Date.now()}`;
  const amountDueCents = 14900; // $149.00

  const attempt = await prisma.recoveryAttempt.create({
    data: {
      workspaceId: workspace.id,
      stripeInvoiceId: invoiceId,
      stripeCustomerId: `cus_sim_${Date.now()}`,
      declineType: "soft",
      status: "pending",
      amountDueCents,
      startedAt: new Date(),
    },
  });

  const amountFormatted = `$${(amountDueCents / 100).toFixed(2)}`;
  console.log(`Recovery attempt: ${attempt.id}`);
  console.log(`Invoice: ${invoiceId} | Amount: ${amountFormatted} | Status: pending\n`);
  console.log("━".repeat(66));
  console.log("  STARTING SEQUENCE — simulating recoveryStartedFunction()");
  console.log("━".repeat(66) + "\n");

  // ── 4. Execute each step ──

  for (const step of sequence.steps) {
    const stepLabel = `Step ${step.stepOrder}/${sequence.steps.length}`;

    // Simulate delay
    if (step.stepOrder > 1) {
      console.log(`  ⏳ ${stepLabel}: Waiting ${stepDelaySec}s (production: ${formatDelay(step.delayHours)})...\n`);
      await sleep(stepDelaySec * 1000);
    }

    console.log(`  ── ${stepLabel}: ${step.subjectTemplate} ──\n`);

    // Check recovery status (mirrors Inngest: refresh-attempt step)
    const latestAttempt = await prisma.recoveryAttempt.findUnique({
      where: { id: attempt.id },
    });
    if (!latestAttempt || latestAttempt.status !== "pending") {
      console.log(`  ⏹  Stopped: recovery is no longer pending (status: ${latestAttempt?.status})\n`);
      break;
    }

    // Generate payment update token (mirrors Inngest: gen-token step)
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await prisma.paymentUpdateToken.create({
      data: {
        workspaceId: workspace.id,
        recoveryAttemptId: attempt.id,
        token,
        expiresAt,
      },
    });
    const paymentUpdateUrl = `${APP_BASE_URL}/update-payment/${token}`;
    console.log(`     Token:   ${token.slice(0, 16)}...`);
    console.log(`     URL:     ${paymentUpdateUrl}`);

    // Render email HTML (mirrors Inngest: send-step)
    const html = renderEmail({
      subject: step.subjectTemplate,
      body: step.bodyTemplate.replace("your recent payment", `your recent payment of ${amountFormatted}`),
      companyName: "DunningDog",
      accentColor: "#10b981",
      paymentUpdateUrl,
    });

    // Send email via SMTP
    try {
      const info = await transporter.sendMail({
        from: `DunningDog <${SMTP_FROM}>`,
        to: toEmail,
        subject: step.subjectTemplate,
        text: step.bodyTemplate,
        html,
      });

      // Log in EmailLog (mirrors Inngest: send-step)
      await prisma.emailLog.create({
        data: {
          workspaceId: workspace.id,
          recoveryAttemptId: attempt.id,
          providerMessageId: info.messageId,
          templateKey: `sequence_${sequence.id}_step_${step.stepOrder}`,
          deliveryStatus: "sent",
          metadata: {
            sequenceId: sequence.id,
            sequenceStepId: step.id,
            stepOrder: step.stepOrder,
            simulation: true,
          },
        },
      });

      console.log(`     Email:   ✓ Sent (${info.messageId})`);
    } catch (error) {
      console.error(`     Email:   ✗ Failed`, error);

      await prisma.emailLog.create({
        data: {
          workspaceId: workspace.id,
          recoveryAttemptId: attempt.id,
          templateKey: `sequence_${sequence.id}_step_${step.stepOrder}`,
          deliveryStatus: "failed",
          metadata: {
            sequenceId: sequence.id,
            sequenceStepId: step.id,
            stepOrder: step.stepOrder,
            simulation: true,
            error: String(error),
          },
        },
      });
    }

    console.log("");
  }

  // ── 5. Summary ──

  const emailLogs = await prisma.emailLog.findMany({
    where: { recoveryAttemptId: attempt.id },
    orderBy: { createdAt: "asc" },
  });

  const tokens = await prisma.paymentUpdateToken.findMany({
    where: { recoveryAttemptId: attempt.id },
    orderBy: { createdAt: "asc" },
  });

  console.log("━".repeat(66));
  console.log("  SEQUENCE COMPLETE");
  console.log("━".repeat(66) + "\n");
  console.log(`  Emails sent:     ${emailLogs.filter((e) => e.deliveryStatus === "sent").length}/${sequence.steps.length}`);
  console.log(`  Tokens created:  ${tokens.length}`);
  console.log(`  Recovery status: ${(await prisma.recoveryAttempt.findUnique({ where: { id: attempt.id } }))?.status}\n`);

  console.log("  What to verify:\n");
  console.log(`  📬  Check your inbox at ${toEmail}`);
  console.log(`      You should have ${sequence.steps.length} emails with different subjects:`);
  for (const step of sequence.steps) {
    console.log(`        ${step.stepOrder}. "${step.subjectTemplate}"`);
  }
  console.log("");
  console.log("  🔗  Each email has a unique payment update link.");
  console.log(`      Open any in your browser (dev server must be running on ${APP_BASE_URL}).\n`);
  console.log("  🗄️   Database records:");
  console.log(`      RecoveryAttempt: ${attempt.id}`);
  console.log(`      EmailLogs: ${emailLogs.length} entries`);
  console.log(`      PaymentUpdateTokens: ${tokens.length} entries (each valid for 72h)\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
