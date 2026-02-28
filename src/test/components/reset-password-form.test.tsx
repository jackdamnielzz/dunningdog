// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/reset-password",
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: Record<string, unknown> & { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { ResetPasswordForm } from "@/components/forms/reset-password-form";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  mockPush.mockReset();
  mockRefresh.mockReset();
  vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      ...window.location,
      hash: "",
      pathname: "/reset-password",
      search: "",
    },
  });
});

describe("ResetPasswordForm", () => {
  it("shows warning when no token in URL hash", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText(/No valid reset token found/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update password" })).toBeDisabled();
  });

  it("submits successfully when valid token is in hash", async () => {
    window.location.hash = "#access_token=a_very_long_valid_token_string_12345";
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ next: "/app" }),
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Update password" })).not.toBeDisabled();
    });

    await user.type(screen.getByLabelText("New password"), "newpass123");
    await user.type(screen.getByLabelText("Confirm new password"), "newpass123");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          accessToken: "a_very_long_valid_token_string_12345",
          password: "newpass123",
        }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/app");
    });
  });

  it("shows error when passwords don't match", async () => {
    window.location.hash = "#access_token=a_very_long_valid_token_string_12345";
    const user = userEvent.setup();

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Update password" })).not.toBeDisabled();
    });

    await user.type(screen.getByLabelText("New password"), "newpass123");
    await user.type(screen.getByLabelText("Confirm new password"), "different");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
