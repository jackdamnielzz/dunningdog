import { describe, expect, it, vi } from "vitest";

async function loadSmtp(config?: {
  host?: string;
  user?: string;
  pass?: string;
  port?: number;
}) {
  vi.resetModules();

  const createTransportMock = vi.fn().mockReturnValue({ sendMail: vi.fn() });

  vi.doMock("nodemailer", () => ({
    default: { createTransport: createTransportMock },
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      SMTP_HOST: config?.host,
      SMTP_PORT: config?.port ?? 465,
      SMTP_USER: config?.user,
      SMTP_PASS: config?.pass,
    },
  }));

  const smtpModule = await import("@/lib/smtp");
  return { smtpModule, createTransportMock };
}

describe("smtp client wrapper", () => {
  it("returns null when SMTP config is not set", async () => {
    const { smtpModule, createTransportMock } = await loadSmtp();

    const transporter = smtpModule.getSmtpTransporter();

    expect(transporter).toBeNull();
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it("returns null when only host is set but user/pass are missing", async () => {
    const { smtpModule } = await loadSmtp({ host: "mail.example.com" });

    expect(smtpModule.getSmtpTransporter()).toBeNull();
  });

  it("creates and caches transporter when config is complete", async () => {
    const { smtpModule, createTransportMock } = await loadSmtp({
      host: "mail.privateemail.com",
      user: "info@dunningdog.com",
      pass: "secret",
      port: 465,
    });

    const first = smtpModule.getSmtpTransporter();
    const second = smtpModule.getSmtpTransporter();

    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(createTransportMock).toHaveBeenCalledWith({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: { user: "info@dunningdog.com", pass: "secret" },
    });
  });

  it("sets secure=false for port 587", async () => {
    const { smtpModule, createTransportMock } = await loadSmtp({
      host: "mail.privateemail.com",
      user: "info@dunningdog.com",
      pass: "secret",
      port: 587,
    });

    smtpModule.getSmtpTransporter();

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ secure: false }),
    );
  });
});
