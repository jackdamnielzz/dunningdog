// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe } from "vitest-axe";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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

import { LoginForm } from "@/components/forms/login-form";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { SocialAuthButtons } from "@/components/forms/social-auth-buttons";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecoveryTable } from "@/components/dashboard/recovery-table";
import { ConnectStripeButton } from "@/components/forms/connect-stripe-button";

describe("accessibility — component a11y checks", () => {
  it("LoginForm has no a11y violations", async () => {
    const { container } = render(<LoginForm nextPath="/app" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ForgotPasswordForm has no a11y violations", async () => {
    const { container } = render(<ForgotPasswordForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("SocialAuthButtons has no a11y violations", async () => {
    const { container } = render(<SocialAuthButtons nextPath="/app" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("SummaryCards has no a11y violations", async () => {
    const { container } = render(
      <SummaryCards
        failedRevenueCents={100000}
        recoveredRevenueCents={50000}
        recoveryRate={50}
        atRiskCount={2}
        activeSequences={1}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("RecoveryTable has no a11y violations", async () => {
    const { container } = render(<RecoveryTable items={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ConnectStripeButton has no a11y violations", async () => {
    const { container } = render(<ConnectStripeButton workspaceId="ws_1" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
