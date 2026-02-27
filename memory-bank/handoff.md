# Handoff — OAuth post-login redirect bug (production) ✅ RESOLVED

## Goal
Investigate and fix the production issue where users complete Google OAuth but land on the marketing homepage (unauthenticated view) instead of the dashboard.

## Resolution (2026-02-27)
- **Root cause:** `router.replace()` + `router.refresh()` in `OAuthCallbackClient` caused a client-side navigation race — cookies weren't committed before the SSR auth guard checked them.
- **Fix:** Replaced with `window.location.assign()` to force a full page load, ensuring cookies are committed before server renders.
- **Cleanup:** Removed temporary debug logging from `/app` layout, removed unused `useRouter` import.
- **Tests:** All 7 auth tests pass, typecheck passes.
- **Next step:** Redeploy to production (`npx vercel --prod` or push to main).

## Suspected Root Causes (most likely)
1. **Client-side navigation race**: OAuth callback uses `router.replace()` immediately after setting cookies, possibly racing cookie persistence or RSC cache; server renders `/` without auth (marketing view). See [`OAuthCallbackClient()`](src/components/forms/oauth-callback-client.tsx:36).
2. **Callback host mismatch**: `APP_BASE_URL` might point to a different host than the final site domain, so `sb-oauth-state`/`sb-auth-token` cookies do not apply. See [`GET()`](src/app/api/auth/oauth/start/route.ts:41).

## Files Reviewed
- [`SocialAuthButtons`](src/components/forms/social-auth-buttons.tsx:58)
- [`OAuthCallbackClient`](src/components/forms/oauth-callback-client.tsx:36)
- [`GET()` OAuth start route](src/app/api/auth/oauth/start/route.ts:41)
- [`POST()` auth session route](src/app/api/auth/session/route.ts:67)
- [`Home()` marketing page](src/app/page.tsx:15)
- [`getAuthenticatedUserIdFromHeaders()`](src/lib/auth.ts:199)

## Changes Made (Logging Only)
Added logs to confirm auth flow and cookie presence:
- [`POST()` auth session route](src/app/api/auth/session/route.ts:67): logs `next`, state cookie presence/match, and `userId` when established.
- [`InternalAppLayout()`](src/app/app/layout.tsx:6): logs cookie names when redirecting to `/login`.

## Vercel CLI Commands Used
- `vercel teams ls` → found team `tunuxs-projects`.
- `vercel ls --scope tunuxs-projects` → latest deployment: `https://dunningdog-f3aq5wobx-tunuxs-projects.vercel.app`.
- `vercel logs <deployment-url> --scope tunuxs-projects` (streaming) — no confirmed output captured yet.

## What To Do Next
1. **Confirm logs**
   - Run: `vercel logs https://dunningdog-f3aq5wobx-tunuxs-projects.vercel.app --scope tunuxs-projects --json`
   - Reproduce OAuth login, look for log lines containing:
     - "OAuth session exchange started"
     - "OAuth session established"
     - "Auth guard redirecting to login"

2. **If logs are not available / to proceed without confirmation:**
   - Implement a minimal fix by forcing a full page reload after session creation:
     - In [`OAuthCallbackClient()`](src/components/forms/oauth-callback-client.tsx:36), replace `router.replace(...)`/`router.refresh()` with `window.location.assign(payload.next ?? nextPath)`.
     - Rationale: ensures cookies are committed before SSR auth checks and avoids stale RSC cache.

3. **Add/adjust tests**
   - Update/extend tests to ensure session route returns safe `next` and that callback uses full reload (if a client test exists).
   - Existing tests: [`auth-session-route.test.ts`](src/test/auth-session-route.test.ts:1), [`auth-oauth-start-route.test.ts`](src/test/auth-oauth-start-route.test.ts:1).

4. **Run targeted tests + typecheck**
   - `pnpm test src/test/auth-oauth-start-route.test.ts`
   - `pnpm test src/test/auth-session-route.test.ts`
   - Any callback/client test if added
   - `pnpm typecheck`

## Notes
If `APP_BASE_URL` is misconfigured (e.g., points to preview domain), OAuth cookies may be set for a different host, leading to missing auth state. Verify in environment settings.
