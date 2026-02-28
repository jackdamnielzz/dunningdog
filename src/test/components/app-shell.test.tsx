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

import { AppShell } from "@/components/dashboard/app-shell";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  mockPush.mockReset();
  mockRefresh.mockReset();
});

describe("AppShell", () => {
  it("renders all 4 navigation links", () => {
    render(<AppShell><div>child content</div></AppShell>);

    const links = screen.getAllByRole("link");
    const navHrefs = links.map((link) => link.getAttribute("href"));
    expect(navHrefs).toContain("/app");
    expect(navHrefs).toContain("/app/recoveries");
    expect(navHrefs).toContain("/app/sequences");
    expect(navHrefs).toContain("/app/settings");
  });

  it("renders children content", () => {
    render(<AppShell><div>dashboard content here</div></AppShell>);
    expect(screen.getByText("dashboard content here")).toBeInTheDocument();
  });

  it("calls logout API and redirects on sign out click", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({ ok: true });

    render(<AppShell><div>content</div></AppShell>);
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?next=/app");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows "Signing out..." while logging out', async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<AppShell><div>content</div></AppShell>);
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(screen.getByRole("button", { name: "Signing out..." })).toBeDisabled();

    resolveFetch({ ok: true });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
