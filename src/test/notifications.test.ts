import { beforeEach, describe, expect, it, vi } from "vitest";

/* ---------- module loader ------------------------------------------------ */

async function loadNotifications(deps?: {
  findMany?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
}) {
  vi.resetModules();

  const findMany = deps?.findMany ?? vi.fn().mockResolvedValue([]);
  const findUnique = deps?.findUnique ?? vi.fn().mockResolvedValue(null);

  vi.doMock("@/lib/db", () => ({
    db: {
      notificationChannel: { findMany, findUnique },
    },
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  // Mock global fetch
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal("fetch", fetchMock);

  const notifications = await import("@/lib/services/notifications");
  return { notifications, findMany, findUnique, fetchMock };
}

/* ---------- helpers ------------------------------------------------------ */

function makeSlackChannel(overrides?: Partial<{
  id: string;
  workspaceId: string;
  type: string;
  webhookUrl: string;
  events: string[];
  isEnabled: boolean;
}>) {
  return {
    id: overrides?.id ?? "ch_1",
    workspaceId: overrides?.workspaceId ?? "ws_1",
    type: overrides?.type ?? "slack",
    webhookUrl: overrides?.webhookUrl ?? "https://hooks.slack.com/services/test",
    events: overrides?.events ?? ["recovery_succeeded"],
    isEnabled: overrides?.isEnabled ?? true,
    label: "test-channel",
  };
}

function makeDiscordChannel(overrides?: Partial<{ id: string }>) {
  return {
    ...makeSlackChannel(overrides),
    type: "discord",
    webhookUrl: "https://discord.com/api/webhooks/test",
    ...(overrides?.id ? { id: overrides.id } : { id: "ch_discord" }),
  };
}

/* ======================================================================== */
/*  Feature 3: Slack & Discord alerts                                        */
/* ======================================================================== */

describe("Feature 3: Slack & Discord alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("sendNotification", () => {
    it("does nothing when no channels match the event", async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "recovery_started",
        data: { stripeCustomerId: "cus_1" },
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("sends Slack notification with Block Kit format", async () => {
      const channel = makeSlackChannel({ events: ["recovery_succeeded"] });
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "recovery_succeeded",
        data: { stripeInvoiceId: "inv_1", recoveredAmountCents: 9900 },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://hooks.slack.com/services/test",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.blocks).toBeDefined();
      expect(body.blocks[0].type).toBe("header");
      expect(body.blocks[0].text.text).toContain("Recovered");
    });

    it("sends Discord notification with embed format", async () => {
      const channel = makeDiscordChannel();
      channel.events = ["recovery_succeeded"];
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "recovery_succeeded",
        data: { stripeInvoiceId: "inv_1", recoveredAmountCents: 5000 },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.embeds).toBeDefined();
      expect(body.embeds[0].title).toContain("Recovered");
      expect(body.embeds[0].timestamp).toBeDefined();
    });

    it("sends to multiple channels simultaneously", async () => {
      const channels = [
        makeSlackChannel({ id: "ch_1", events: ["recovery_started"] }),
        makeDiscordChannel({ id: "ch_2" }),
      ];
      channels[1].events = ["recovery_started"];
      const findMany = vi.fn().mockResolvedValue(channels);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "recovery_started",
        data: { stripeCustomerId: "cus_1", stripeInvoiceId: "inv_1", amountDueCents: 4999, declineType: "soft" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("handles webhook failure gracefully (no throw)", async () => {
      const channel = makeSlackChannel({ events: ["recovery_failed"] });
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      // Should not throw
      await expect(
        notifications.sendNotification({
          workspaceId: "ws_1",
          event: "recovery_failed",
          data: { stripeInvoiceId: "inv_1", amountDueCents: 1000, reason: "card_declined" },
        }),
      ).resolves.toBeUndefined();
    });

    it("handles network error gracefully (no throw)", async () => {
      const channel = makeSlackChannel({ events: ["recovery_started"] });
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      fetchMock.mockRejectedValueOnce(new Error("Network unreachable"));

      await expect(
        notifications.sendNotification({
          workspaceId: "ws_1",
          event: "recovery_started",
          data: { stripeCustomerId: "cus_1" },
        }),
      ).resolves.toBeUndefined();
    });

    it("formats recovery_started with correct fields", async () => {
      const channel = makeSlackChannel({ events: ["recovery_started"] });
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "recovery_started",
        data: {
          stripeCustomerId: "cus_abc",
          stripeInvoiceId: "inv_xyz",
          amountDueCents: 4999,
          declineType: "soft",
        },
      });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.blocks[0].text.text).toContain("Recovery Started");
      expect(body.blocks[1].text.text).toContain("cus_abc");
    });

    it("formats predunning_sent with correct fields", async () => {
      const channel = makeSlackChannel({ events: ["predunning_sent"] });
      const findMany = vi.fn().mockResolvedValue([channel]);
      const { notifications, fetchMock } = await loadNotifications({ findMany });

      await notifications.sendNotification({
        workspaceId: "ws_1",
        event: "predunning_sent",
        data: {
          stripeCustomerId: "cus_1",
          stripeSubscriptionId: "sub_1",
          expirationDate: "2026-04-01",
        },
      });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.blocks[0].text.text).toContain("Pre-Dunning");
    });
  });

  describe("sendTestNotification", () => {
    it("sends a test notification to the channel", async () => {
      const channel = makeSlackChannel({ id: "ch_test" });
      const findUnique = vi.fn().mockResolvedValue(channel);
      const { notifications, fetchMock } = await loadNotifications({ findUnique });

      const result = await notifications.sendTestNotification("ch_test", "ws_1");

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.blocks[0].text.text).toContain("Recovered");
    });

    it("returns false when channel not found", async () => {
      const findUnique = vi.fn().mockResolvedValue(null);
      const { notifications, fetchMock } = await loadNotifications({ findUnique });

      const result = await notifications.sendTestNotification("ch_nonexistent", "ws_1");

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns false when channel belongs to different workspace", async () => {
      const channel = makeSlackChannel({ id: "ch_other" });
      channel.workspaceId = "ws_other";
      const findUnique = vi.fn().mockResolvedValue(channel);
      const { notifications, fetchMock } = await loadNotifications({ findUnique });

      const result = await notifications.sendTestNotification("ch_other", "ws_1");

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns false when webhook returns non-OK", async () => {
      const channel = makeSlackChannel();
      const findUnique = vi.fn().mockResolvedValue(channel);
      const { notifications, fetchMock } = await loadNotifications({ findUnique });

      fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await notifications.sendTestNotification("ch_1", "ws_1");

      expect(result).toBe(false);
    });

    it("sends Discord test notification with embeds", async () => {
      const channel = makeDiscordChannel();
      const findUnique = vi.fn().mockResolvedValue(channel);
      const { notifications, fetchMock } = await loadNotifications({ findUnique });

      await notifications.sendTestNotification("ch_discord", "ws_1");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.embeds).toBeDefined();
      expect(body.embeds[0].title).toContain("Recovered");
    });
  });
});
