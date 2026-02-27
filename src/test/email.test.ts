import { beforeEach, describe, expect, it, vi } from "vitest";

type EmailOptions = {
  demoMode: boolean;
  resendEnabled: boolean;
};

async function loadEmail(options: EmailOptions) {
  vi.resetModules();

  const sendMock = vi.fn().mockResolvedValue({
    data: { id: "re_msg_1" },
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
      RESEND_FROM_EMAIL: "billing@dunningdog.com",
    },
    isDemoMode: options.demoMode,
  }));

  vi.doMock("@/lib/resend", () => ({
    getResendClient: () =>
      options.resendEnabled
        ? {
            emails: {
              send: sendMock,
            },
          }
        : null,
  }));

  vi.doMock("@/lib/logger", () => ({
    log: logMock,
  }));

  const email = await import("@/lib/services/email");
  return {
    email,
    sendMock,
    emailLogCreateMock,
    logMock,
  };
}

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends through Resend when live mode is enabled", async () => {
    const { email, sendMock, emailLogCreateMock } = await loadEmail({
      demoMode: false,
      resendEnabled: true,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_1",
      toEmail: "customer@example.com",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId: "ws_1",
          deliveryStatus: "sent",
        }),
      }),
    );
  });

  it("records demo-mode email sends without calling Resend", async () => {
    const { email, sendMock, emailLogCreateMock } = await loadEmail({
      demoMode: true,
      resendEnabled: false,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_2",
      toEmail: "demo-customer@example.com",
    });

    expect(sendMock).not.toHaveBeenCalled();
    expect(emailLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryStatus: "sent",
          templateKey: "step_2",
        }),
      }),
    );
  });

  it("marks delivery failed when Resend throws", async () => {
    const { email, sendMock, emailLogCreateMock, logMock } = await loadEmail({
      demoMode: false,
      resendEnabled: true,
    });

    sendMock.mockRejectedValueOnce(new Error("Resend timeout"));

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
    const { email, sendMock, emailLogCreateMock, logMock } = await loadEmail({
      demoMode: false,
      resendEnabled: true,
    });

    await email.sendDunningEmail({
      workspaceId: "ws_1",
      subject: "Payment failed",
      body: "Please update your card",
      templateKey: "step_3",
      toEmail: undefined,
    });

    expect(sendMock).not.toHaveBeenCalled();
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
