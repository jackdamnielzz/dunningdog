import { beforeEach, describe, expect, it, vi } from "vitest";

type EmailOptions = {
  demoMode: boolean;
  smtpEnabled: boolean;
};

async function loadEmail(options: EmailOptions) {
  vi.resetModules();

  const sendMailMock = vi.fn().mockResolvedValue({
    messageId: "<test-msg-id@dunningdog.com>",
  });
  const emailLogCreateMock = vi.fn().mockResolvedValue({
    id: "email_log_1",
    deliveryStatus: "sent",
  });
  const logMock = vi.fn();

  vi.doMock("@/lib/db", () => ({
    db: {
      emailLog: {
        create: emailLogCreateMock,
      },
    },
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      SMTP_FROM_EMAIL: "info@dunningdog.com",
    },
    isDemoMode: options.demoMode,
  }));

  vi.doMock("@/lib/smtp", () => ({
    getSmtpTransporter: () =>
      options.smtpEnabled
        ? { sendMail: sendMailMock }
        : null,
  }));

  vi.doMock("@/lib/logger", () => ({
    log: logMock,
  }));

  const email = await import("@/lib/services/email");
  return {
    email,
    sendMailMock,
    emailLogCreateMock,
    logMock,
  };
}

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends through SMTP when live mode is enabled", async () => {
    const { email, sendMailMock, emailLogCreateMock } = await loadEmail({
      demoMode: false,
      smtpEnabled: true,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_1",
      toEmail: "customer@example.com",
    });

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: "Payment failed",
      }),
    );
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: "ws_1",
          deliveryStatus: "sent",
        }),
      }),
    );
  });

  it("records demo-mode email sends without calling SMTP", async () => {
    const { email, sendMailMock, emailLogCreateMock } = await loadEmail({
      demoMode: true,
      smtpEnabled: false,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_2",
      toEmail: "demo-customer@example.com",
    });

    expect(sendMailMock).not.toHaveBeenCalled();
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "sent",
          templateKey: "step_2",
        }),
      }),
    );
  });

  it("marks delivery failed when SMTP throws", async () => {
    const { email, sendMailMock, emailLogCreateMock, logMock } = await loadEmail({
      demoMode: false,
      smtpEnabled: true,
    });

    sendMailMock.mockRejectedValueOnce(new Error("SMTP timeout"));

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_4",
      toEmail: "customer@example.com",
    });

    expect(logMock).toHaveBeenCalledWith(
      "error",
      "Failed to send dunning email",
      expect.objectContaining({
        workspaceId: "ws_1",
      }),
    );
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "failed",
          templateKey: "step_4",
        }),
      }),
    );
  });

  it("skips sending when no toEmail is provided", async () => {
    const { email, sendMailMock, emailLogCreateMock, logMock } = await loadEmail({
      demoMode: false,
      smtpEnabled: true,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_3",
      toEmail: undefined,
    });

    expect(sendMailMock).not.toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(
      "warn",
      "Skipping dunning email send: no recipient email resolved",
      expect.objectContaining({
        workspaceId: "ws_1",
        templateKey: "step_3",
      }),
    );
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "failed",
          templateKey: "step_3",
        }),
      }),
    );
  });
});
