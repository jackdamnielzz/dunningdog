interface EmailBranding {
  companyName?: string | null;
  logoUrl?: string | null;
  accentColor: string;
  footerText?: string | null;
}

interface RenderParams {
  subject: string;
  body: string;
  branding: EmailBranding | null;
  paymentUpdateUrl?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDunningEmailHtml(params: RenderParams): string {
  const accent = params.branding?.accentColor ?? "#10b981";
  const companyName = params.branding?.companyName ?? "DunningDog";
  const logoUrl = params.branding?.logoUrl;
  const footerText = params.branding?.footerText ?? "";

  const bodyHtml = escapeHtml(params.body).replace(/\n/g, "<br>");

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" style="max-height:48px;max-width:200px;margin-bottom:12px;" />`
    : "";

  const ctaBlock = params.paymentUpdateUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background-color:${accent};border-radius:6px;padding:12px 28px;">
            <a href="${escapeHtml(params.paymentUpdateUrl)}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">Update payment method</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(params.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header accent bar -->
          <tr>
            <td style="height:4px;background-color:${accent};"></td>
          </tr>
          <!-- Logo / company -->
          <tr>
            <td style="padding:28px 32px 0;">
              ${logoBlock}
              ${!logoUrl ? `<p style="margin:0;font-size:18px;font-weight:700;color:#18181b;">${escapeHtml(companyName)}</p>` : ""}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:20px 32px 8px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#3f3f46;">
                ${bodyHtml}
              </p>
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 28px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">
                Sent by ${escapeHtml(companyName)}${footerText ? ` &mdash; ${escapeHtml(footerText)}` : ""}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
