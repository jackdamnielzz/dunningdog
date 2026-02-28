// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/app/settings",
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: Record<string, unknown> & { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";

const fetchMock = vi.fn();
const originalLocation = window.location;

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...originalLocation, href: "" },
  });
});
afterEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: originalLocation,
  });
});

describe("ConnectStripeButton", () => {
  it('renders "Connect Stripe" button', () => {
    render(<ConnectStripeButton workspaceId="ws_123" />);
    expect(screen.getByRole("button", { name: "Connect Stripe" })).toBeInTheDocument();
  });

  it("POSTs to connect start endpoint on click", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ redirectUrl: "https://connect.stripe.com/setup" }),
    });

    render(<ConnectStripeButton workspaceId="ws_123" />);
    await user.click(screen.getByRole("button", { name: "Connect Stripe" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/stripe/connect/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspaceId: "ws_123" }),
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe("https://connect.stripe.com/setup");
    });
  });

  it('shows "Connecting..." while pending', async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<ConnectStripeButton workspaceId="ws_123" />);
    await user.click(screen.getByRole("button", { name: "Connect Stripe" }));

    expect(screen.getByRole("button", { name: "Connecting..." })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({ redirectUrl: "https://connect.stripe.com/setup" }),
    });

    await waitFor(() => {
      expect(window.location.href).toBe("https://connect.stripe.com/setup");
    });
  });
});
