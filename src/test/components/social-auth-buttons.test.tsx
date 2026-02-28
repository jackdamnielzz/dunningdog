// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SocialAuthButtons } from "@/components/forms/social-auth-buttons";

describe("SocialAuthButtons", () => {
  it("renders Google and Microsoft links with correct hrefs", () => {
    render(<SocialAuthButtons nextPath="/app" />);

    const googleLink = screen.getByLabelText("Continue with Google");
    const microsoftLink = screen.getByLabelText("Continue with Microsoft");

    expect(googleLink).toBeInTheDocument();
    expect(microsoftLink).toBeInTheDocument();
    expect(googleLink).toHaveAttribute("href", "/api/auth/oauth/start?provider=google&next=%2Fapp");
    expect(microsoftLink).toHaveAttribute("href", "/api/auth/oauth/start?provider=microsoft&next=%2Fapp");
  });

  it('sanitizes nextPath — "//evil" results in next=%2Fapp in href', () => {
    render(<SocialAuthButtons nextPath="//evil" />);

    const googleLink = screen.getByLabelText("Continue with Google");
    expect(googleLink).toHaveAttribute("href", "/api/auth/oauth/start?provider=google&next=%2Fapp");
  });
});
