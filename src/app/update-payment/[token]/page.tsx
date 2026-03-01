import { validatePaymentUpdateToken } from "@/lib/services/payment-tokens";
import { getBranding } from "@/lib/services/branding";
import { db } from "@/lib/db";
import { DEFAULT_ACCENT_COLOR } from "@/lib/constants";
import { PaymentUpdateForm } from "./payment-form";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PaymentUpdatePage({ params }: PageProps) {
  const { token } = await params;
  const tokenData = await validatePaymentUpdateToken(token);

  if (!tokenData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Link expired or invalid</h1>
          <p className="mt-2 text-sm text-zinc-600">
            This payment update link has expired or has already been used. Please contact support or check your email for a new link.
          </p>
        </div>
      </div>
    );
  }

  const [branding, attempt] = await Promise.all([
    getBranding(tokenData.workspaceId).catch(() => null),
    db.recoveryAttempt.findUnique({
      where: { id: tokenData.recoveryAttemptId },
      select: {
        stripeInvoiceId: true,
        amountDueCents: true,
        stripeCustomerId: true,
      },
    }),
  ]);

  const accentColor = branding?.accentColor ?? DEFAULT_ACCENT_COLOR;
  const companyName = branding?.companyName ?? "DunningDog";
  const logoUrl = branding?.logoUrl;
  const amountDue = attempt ? `$${(attempt.amountDueCents / 100).toFixed(2)}` : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Accent bar */}
        <div style={{ height: 4, backgroundColor: accentColor }} />

        <div className="p-8">
          {/* Branding */}
          <div className="mb-6 text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="mx-auto mb-3 max-h-12 max-w-[200px]"
              />
            ) : (
              <h2 className="text-lg font-bold text-zinc-900">{companyName}</h2>
            )}
          </div>

          {/* Invoice details */}
          <div className="mb-6 rounded-lg bg-zinc-50 p-4">
            <h1 className="text-lg font-semibold text-zinc-900">Update your payment method</h1>
            <p className="mt-1 text-sm text-zinc-600">
              We were unable to process a recent payment. Please update your card details below to keep your subscription active.
            </p>
            {amountDue && (
              <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
                <span className="text-sm text-zinc-600">Amount due</span>
                <span className="text-lg font-bold text-zinc-900">{amountDue}</span>
              </div>
            )}
          </div>

          {/* Payment form */}
          <PaymentUpdateForm token={token} accentColor={accentColor} />
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-8 py-4">
          <p className="text-center text-xs text-zinc-400">
            Secured by Stripe. Powered by {companyName}.
          </p>
        </div>
      </div>
    </div>
  );
}
