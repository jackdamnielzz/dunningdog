import { NextResponse } from "next/server";
import { z } from "zod";
import { getSmtpTransporter } from "@/lib/smtp";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;
  const transporter = getSmtpTransporter();

  if (!transporter) {
    log("error", "Contact form: SMTP not configured");
    return NextResponse.json(
      { error: "Email service is not configured. Please try again later." },
      { status: 503 },
    );
  }

  try {
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    log("error", "Contact form: failed to send", { error });
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
