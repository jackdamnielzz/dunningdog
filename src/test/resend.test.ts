import { describe, expect, it, vi } from "vitest";

async function loadResend(resendApiKey?: string) {
  vi.resetModules();

  const resendCtor = vi.fn(function ResendMock(this: { key: string }, key: string) {
    this.key = key;
  });

  vi.doMock("resend", () => ({
    Resend: resendCtor,
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      RESEND_API_KEY: resendApiKey,
    },
  }));

  const resendModule = await import("@/lib/resend");

  return { resendModule, resendCtor };
}

describe("resend client wrapper", () => {
  it("returns null when resend key is not configured", async () => {
    const { resendModule, resendCtor } = await loadResend(undefined);

    const client = resendModule.getResendClient();

    expect(client).toBeNull();
    expect(resendCtor).not.toHaveBeenCalled();
  });

  it("creates and caches resend client when key is configured", async () => {
    const { resendModule, resendCtor } = await loadResend("re_test_123");

    const first = resendModule.getResendClient();
    const second = resendModule.getResendClient();

    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(resendCtor).toHaveBeenCalledTimes(1);
    expect(resendCtor).toHaveBeenCalledWith("re_test_123");
  });
});
