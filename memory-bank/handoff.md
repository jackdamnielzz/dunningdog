# Handoff — OAuth still failing after deploy (`access_token` too short)

## Goal
Fix the production issue where Google OAuth login from `https://dunningdog.vercel.app` redirects to `http://localhost:3000/?error=invalid_request&error_code=bad_oauth_state` instead of completing sign-in.

## Current Status (2026-02-27)

**Production still failing after deploy.** New error shown on callback UI:
```
Too small: expected string to have >=20 characters
```
This appears on the **Signing you in** screen. The URL ends at:
`https://dunningdog.vercel.app/auth/callback?...`

### What is fixed already
1. **Supabase Dashboard config via Management API:**
   - `site_url`: `http://localhost:3000` → `https://dunningdog.vercel.app` ✅
   - `uri_allow_list`: Added `https://dunningdog.vercel.app/auth/callback` (kept `http://localhost:3000/auth/callback`) ✅
   - `external_google_enabled`: `true` ✅

2. **Supabase state conflict fix in app:**
   - Stop sending `state` to Supabase authorize
   - Include app state in callback URL as `app_state`
   - Read `app_state` in [`OAuthCallbackClient()`](src/components/forms/oauth-callback-client.tsx:35)

3. **Production redeploy** completed and aliased to `https://dunningdog.vercel.app` ✅

### What is still wrong
The error comes from Zod validation in [`POST /api/auth/session`](src/app/api/auth/session/route.ts:8):
`accessToken` is present but too short (< 20 chars). That suggests **the callback does not contain a real access token**.

**Most likely cause:** Supabase is returning an **auth code** (PKCE flow) instead of `access_token`. Our client expects an `access_token` in the URL hash/query.

### Critical next steps
1. **Capture the full callback URL** (query + hash) after Google login and confirm if it contains:
   - `access_token` (implicit flow) **or**
   - `code` (PKCE flow)

2. **If `code` is present and no access_token:**
   - Either switch Supabase Auth **Flow Type** to *Implicit* in Dashboard (quick fix), **or**
   - Implement code exchange: use Supabase `/auth/v1/token` to exchange `code` for tokens, then call `/api/auth/session` with the real access token.

3. **Fix callback state precedence:**
   The callback currently prioritizes `state` over `app_state`. It should prefer `app_state` so the cookie state matches.

### Relevant files
- [`GET /api/auth/oauth/start`](src/app/api/auth/oauth/start/route.ts:41)
- [`OAuthCallbackClient()`](src/components/forms/oauth-callback-client.tsx:35)
- [`POST /api/auth/session`](src/app/api/auth/session/route.ts:8)

### Deployment info
Latest prod deployment:
`https://dunningdog-2zyau29mg-tunuxs-projects.vercel.app` (aliased to `https://dunningdog.vercel.app`)

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
