import Link from "next/link";

interface SocialAuthButtonsProps {
  nextPath: string;
}

function normalizeNextPath(path: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/app";
  }
  return path;
}

function buildStartUrl(provider: "google" | "microsoft", nextPath: string) {
  return `/api/auth/oauth/start?provider=${provider}&next=${encodeURIComponent(normalizeNextPath(nextPath))}`;
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v4.08h5.67c-.25 1.31-.99 2.41-2.05 3.15l3.31 2.57c1.93-1.78 3.05-4.4 3.05-7.5 0-.73-.07-1.43-.2-2.1H12z"
      />
      <path
        fill="#4285F4"
        d="M12 22c2.76 0 5.08-.91 6.78-2.47l-3.31-2.57c-.92.62-2.09.99-3.47.99-2.67 0-4.93-1.8-5.74-4.23H2.84v2.66A10 10 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.26 13.72A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.26-1.72V7.62H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.46l3.18-2.74z"
      />
      <path
        fill="#34A853"
        d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.07 2.99 14.75 2 12 2A10 10 0 0 0 2.84 7.62l3.42 2.66c.81-2.43 3.07-4.23 5.74-4.23z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
    >
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function SocialAuthButtons({ nextPath }: SocialAuthButtonsProps) {
  const googleLabel = "Continue with Google";
  const microsoftLabel = "Continue with Microsoft";

  return (
    <div className="space-y-2">
      <Link
        href={buildStartUrl("google", nextPath)}
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[#747775] bg-white px-3 text-[14px] font-medium leading-5 text-[#1F1F1F] transition-colors hover:bg-[#f8f9fa]"
        style={{ fontFamily: "var(--font-roboto), Roboto, sans-serif" }}
        aria-label={googleLabel}
      >
        <span className="inline-flex items-center gap-[10px]">
          <GoogleIcon />
          <span>{googleLabel}</span>
        </span>
      </Link>
      <Link
        href={buildStartUrl("microsoft", nextPath)}
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-[14px] font-medium leading-5 text-zinc-900 transition-colors hover:bg-zinc-50"
        style={{ fontFamily: "var(--font-roboto), Roboto, sans-serif" }}
        aria-label={microsoftLabel}
      >
        <span className="inline-flex items-center gap-[10px]">
          <MicrosoftIcon />
          <span>{microsoftLabel}</span>
        </span>
      </Link>
    </div>
  );
}
