/**
 * Test the complete dunning recovery flow end-to-end.
 *
 * This script:
 *   Level 1 — Seeds test data (workspace, recovery attempt, payment token)
 *   Level 2 — Sends a REAL dunning email via SMTP to your inbox
 *   Level 3 — Provides instructions for full webhook flow
 *
 * Usage:
 *   npx tsx scripts/test-recovery-flow.mts <your-email@example.com>
 *
 * Prerequisites:
 *   - Database running with schema pushed (pnpm db:setup)
 *   - SMTP env vars set in .env.local (SMTP_HOST, SMTP_USER, SMTP_PASS, etc.)
 *   - Dev server running at APP_BASE_URL (default: http://localhost:3000)
 */

import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

// ── Config ──────────────────────────────────────────────────────────────────

const toEmail = process.argv[2];
if (!toEmail || !toEmail.includes("@")) {
  console.error("Usage: npx tsx scripts/test-recovery-flow.mts <your-email@example.com>");
  process.exit(1);
}

const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL || "info@dunningdog.com";

const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║        DunningDog — Recovery Flow Test Script               ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // ── Level 1: Seed test data ──

  console.log("━━━ Level 1: Seeding test data ━━━\n");

  // Find or create a test workspace
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
    console.log(`  ✓ Created workspace: ${workspace.id}`);
  } else {
    console.log(`  ✓ Found existing workspace: ${workspace.id}`);
  }

  // Create a recovery attempt
  const invoiceId = `in_test_${Date.now()}`;
  const recoveryAttempt = await prisma.recoveryAttempt.create({
    data: {
      workspaceId: workspace.id,
      stripeInvoiceId: invoiceId,
      stripeCustomerId: `cus_test_${Date.now()}`,
      declineType: "soft",
      status: "pending",
      amountDueCents: 4999,
      startedAt: new Date(),
    },
  });
  console.log(`  ✓ Created recovery attempt: ${recoveryAttempt.id}`);
  console.log(`    Invoice: ${invoiceId} | Amount: $49.99 | Decline: soft`);

  // Create a payment update token
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  await prisma.paymentUpdateToken.create({
    data: {
      workspaceId: workspace.id,
      recoveryAttemptId: recoveryAttempt.id,
      token,
      expiresAt,
    },
  });

  const paymentUpdateUrl = `${APP_BASE_URL}/update-payment/${token}`;
  console.log(`  ✓ Created payment update token (expires in 72h)`);
  console.log(`\n  🔗 Payment update URL:`);
  console.log(`     ${paymentUpdateUrl}\n`);
  console.log(`  → Open this URL in your browser to see the payment update page.\n`);

  // ── Level 2: Send a real email ──

  console.log("━━━ Level 2: Sending dunning email ━━━\n");

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("  ⚠  SMTP not configured — skipping email send.");
    console.log("     Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local to enable.\n");
  } else {
    const subject = "Action needed: update your payment details";
    const body =
      "We were unable to process your recent payment of $49.99.\n\n" +
      "Please update your payment method to avoid interruption to your subscription. " +
      "Click the button below to securely update your card details.\n\n" +
      "If you have already resolved this, please disregard this email.";

    const html = renderEmail({
      subject,
      body,
      companyName: "DunningDog Test",
      accentColor: "#10b981",
      paymentUpdateUrl,
    });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    console.log(`  Sending to: ${toEmail}`);
    console.log(`  From: DunningDog Test <${SMTP_FROM}>`);
    console.log(`  Subject: ${subject}`);

    try {
      const info = await transporter.sendMail({
        from: `DunningDog Test <${SMTP_FROM}>`,
        to: toEmail,
        subject,
        text: body,
        html,
      });
      console.log(`  ✓ Email sent! Message ID: ${info.messageId}`);
      console.log(`\n  📬 Check your inbox at ${toEmail}`);
      console.log(`     Click the "Update payment method" button in the email.`);
      console.log(`     It will open: ${paymentUpdateUrl}\n`);

      // Log in database
      await prisma.emailLog.create({
        data: {
          workspaceId: workspace.id,
          recoveryAttemptId: recoveryAttempt.id,
          providerMessageId: info.messageId,
          templateKey: "test_recovery_flow",
          deliveryStatus: "sent",
          metadata: { testScript: true, toEmail },
        },
      });
    } catch (error) {
      console.error(`  ✗ Failed to send email:`, error);
    }
  }

  // ── Level 3: Full webhook instructions ──

  console.log("━━━ Level 3: Full webhook flow ━━━\n");
  console.log("  To test the complete flow (Stripe webhook → Inngest → email):\n");
  console.log("  1. Start the dev server:  pnpm dev");
  console.log("  2. Start Inngest dev:     npx inngest-cli@latest dev");
  console.log("  3. Run the webhook test:  npx tsx scripts/test-webhook.mts\n");
  console.log("  This will:");
  console.log("    • Send a fake invoice.payment_failed webhook");
  console.log("    • Create a recovery attempt in the database");
  console.log("    • Trigger Inngest to run the dunning sequence");
  console.log("    • Send emails at configured intervals (step 1: immediate, step 2: 72h, step 3: 168h)\n");
  console.log("  Note: test-webhook.mts requires a connected Stripe account in the DB");
  console.log("  and STRIPE_WEBHOOK_SECRET in your environment.\n");

  // ── Summary ──

  console.log("━━━ Summary ━━━\n");
  console.log("  What to verify at each level:\n");
  console.log("  Level 1 (page):    Visit the payment URL → see branded page with $49.99 due");
  console.log("  Level 2 (email):   Check inbox → click button → lands on payment page");
  console.log("  Level 3 (webhook): Check Inngest UI → recovery created → emails queued\n");
  console.log("  ⚠  The 'Update payment method' button on the page will try to create");
  console.log("     a Stripe Billing Portal session. Without a real Stripe customer,");
  console.log(`     it falls back to: ${paymentUpdateUrl}?status=success\n`);
  console.log("Done! ✓\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
