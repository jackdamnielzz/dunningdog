# Handoff — OAuth `bad_oauth_state` + localhost redirect ✅ RESOLVED

## Goal
Fix the production issue where Google OAuth login from `https://dunningdog.vercel.app` redirects to `http://localhost:3000/?error=invalid_request&error_code=bad_oauth_state` instead of completing sign-in.

## Resolution (2026-02-27)

**Root cause:** Supabase Dashboard had `site_url` set to `http://localhost:3000` and `uri_allow_list` only contained `http://localhost:3000/auth/callback`. This caused Supabase to redirect to localhost on OAuth errors and reject the production callback URL.

**Fix applied via Supabase Management API:**
- `site_url`: `http://localhost:3000` → `https://dunningdog.vercel.app` ✅
- `uri_allow_list`: Added `https://dunningdog.vercel.app/auth/callback` (kept `http://localhost:3000/auth/callback` for local dev) ✅
- `external_google_enabled`: `true` ✅ (already configured)

**No code changes were needed.** All application code and Vercel env vars were already correct.

**Verified post-fix:**
- OAuth start route returns `redirect_to=https://dunningdog.vercel.app/auth/callback?next=/app` ✅
- Production deployment is healthy (`https://dunningdog.vercel.app`) ✅

## Files Reviewed (no changes needed)
- [`SocialAuthButtons`](src/components/forms/social-auth-buttons.tsx:58) — builds `/api/auth/oauth/start` URL
- [`GET()` OAuth start route](src/app/api/auth/oauth/start/route.ts:41) — redirects to Supabase authorize with `redirect_to`
- [`OAuthCallbackClient`](src/components/forms/oauth-callback-client.tsx:36) — exchanges tokens, navigates to `/app`
- [`POST()` auth session route](src/app/api/auth/session/route.ts:67) — validates state, sets session cookies
- [`env.ts`](src/lib/env.ts:17) — `APP_BASE_URL` default is `http://localhost:3000` (overridden by Vercel env)

## Vercel Environment (verified ✅)
- `APP_BASE_URL` = `https://dunningdog.vercel.app`
- `NEXT_PUBLIC_APP_BASE_URL` = `https://dunningdog.vercel.app`
- `SUPABASE_URL` = `https://ktpsrzznftgxkywjxiek.supabase.co`
- `SUPABASE_ANON_KEY` = correctly set (raw JWT)

## Supabase Auth Config (verified ✅)
- `site_url` = `https://dunningdog.vercel.app`
- `uri_allow_list` = `https://dunningdog.vercel.app/auth/callback,http://localhost:3000/auth/callback`
- `external_google_enabled` = `true`
