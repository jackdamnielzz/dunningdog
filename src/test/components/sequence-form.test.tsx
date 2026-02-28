// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/app/sequences",
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: Record<string, unknown> & { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { SequenceForm } from "@/components/forms/sequence-form";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

describe("SequenceForm", () => {
  it("renders sequence name and 3 step fieldsets", () => {
    render(<SequenceForm workspaceId="ws_123" />);
    expect(screen.getByLabelText("Sequence Name")).toBeInTheDocument();
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
    expect(screen.getByText(/Step 2/)).toBeInTheDocument();
    expect(screen.getByText(/Step 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save sequence" })).toBeInTheDocument();
  });

  it("shows success message after saving (POST for new)", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<SequenceForm workspaceId="ws_123" />);
    await user.click(screen.getByRole("button", { name: "Save sequence" }));

    await waitFor(() => {
      expect(screen.getByText("Sequence saved successfully.")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dunning/sequences",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("uses PATCH when existingSequenceId is provided", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<SequenceForm workspaceId="ws_123" existingSequenceId="seq_42" />);
    await user.click(screen.getByRole("button", { name: "Save sequence" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/dunning/sequences/seq_42",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("shows error message on API failure", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Validation failed" }),
    });

    render(<SequenceForm workspaceId="ws_123" />);
    await user.click(screen.getByRole("button", { name: "Save sequence" }));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
  });
});
