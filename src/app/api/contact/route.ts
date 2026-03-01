import { z } from "zod";
import { parseJsonBody, ok, routeError } from "@/lib/api";
import { ProblemError } from "@/lib/problem";
import { getSmtpTransporter } from "@/lib/smtp";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { escapeHtml } from "@/lib/services/email-template";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

const instance = "/api/contact";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await parseJsonBody(request, contactSchema);
    const transporter = getSmtpTransporter();

    if (!transporter) {
      log("error", "Contact form: SMTP not configured");
      throw new ProblemError({
        title: "Email service unavailable",
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        detail: "Email service is not configured. Please try again later.",
      });
    }

    await transporter.sendMail({
      from: `DunningDog Contact <${env.SMTP_FROM_EMAIL}>`,
      to: "info@dunningdog.com",
      replyTo: email,
      subject: `Contact form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: [
        `<h3>New contact form submission</h3>`,
        `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<hr />`,
        `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
      ].join("\n"),
    });

    return ok({ ok: true });
  } catch (error) {
    return routeError(error, instance);
  }
}
