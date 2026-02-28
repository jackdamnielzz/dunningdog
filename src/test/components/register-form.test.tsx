// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/app",
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: Record<string, unknown> & { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("@/components/forms/social-auth-buttons", () => ({
  SocialAuthButtons: () => <div data-testid="social-auth" />,
}));

import { RegisterForm } from "@/components/forms/register-form";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  mockPush.mockReset();
  mockRefresh.mockReset();
});

describe("RegisterForm", () => {
  it("renders all three fields with labels", () => {
    render(<RegisterForm nextPath="/app" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  it("shows error when passwords don't match (no fetch call)", async () => {
    const user = userEvent.setup();
    render(<RegisterForm nextPath="/app" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits and redirects when authenticated", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, next: "/dashboard" }),
    });

    render(<RegisterForm nextPath="/app" />);
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows confirmation notice when email confirmation required", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requiresEmailConfirmation: true }),
    });

    render(<RegisterForm nextPath="/app" />);
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText(/Check your inbox to confirm your email/)).toBeInTheDocument();
    });
    expect(screen.getByText("Go to sign in")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows error on API failure", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Email already in use" }),
    });

    render(<RegisterForm nextPath="/app" />);
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.type(screen.getByLabelText("Confirm password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
