# Handoff — OAuth `bad_oauth_state` + localhost redirect (production)

## Goal
Fix the production issue where Google OAuth login from `https://dunningdog.vercel.app` redirects to `http://localhost:3000/?error=invalid_request&error_code=bad_oauth_state` instead of completing sign-in.

## Root Cause Analysis (2026-02-27)

**Two problems observed:**
1. After Google OAuth on `https://dunningdog.vercel.app`, browser lands on `http://localhost:3000/` — a completely different origin
2. URL contains `?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+parameter+is+invalid`

**Root cause: Supabase Dashboard misconfiguration**

The Supabase project's URL configuration (in the Supabase Dashboard under **Authentication → URL Configuration**) has:
- **Site URL** set to `http://localhost:3000` instead of `https://dunningdog.vercel.app`
- **Redirect URLs** whitelist missing `https://dunningdog.vercel.app/auth/callback`

This causes:
1. When Supabase's internal PKCE state validation fails (or on any OAuth error), it redirects to its configured **Site URL** → `http://localhost:3000`
2. The `bad_oauth_state` error occurs because Supabase cannot properly manage its OAuth flow cookies across the redirect chain when the Site URL doesn't match the actual origin

**Code is correct** — verified:
- [`GET()`](src/app/api/auth/oauth/start/route.ts:41) builds `redirect_to` using `env.APP_BASE_URL`
- Vercel `APP_BASE_URL` = `https://dunningdog.vercel.app` ✅
- Vercel `SUPABASE_URL` = `https://ktpsrzznftgxkywjxiek.supabase.co` ✅
- [`OAuthCallbackClient()`](src/components/forms/oauth-callback-client.tsx:36) uses `window.location.assign()` ✅
- [`POST()` session route](src/app/api/auth/session/route.ts:67) validates state + sets cookies ✅

## Fix Required (Supabase Dashboard — manual steps)

Go to: **https://supabase.com/dashboard/project/ktpsrzznftgxkywjxiek/auth/url-configuration**

### 1. Update Site URL
Change **Site URL** from:
```
http://localhost:3000
```
To:
```
https://dunningdog.vercel.app
```

### 2. Add Redirect URLs
Add these to the **Redirect URLs** whitelist:
```
https://dunningdog.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

The first is for production. The second is for local development.

### 3. Verify Google OAuth Provider
In **Authentication → Providers → Google**, confirm:
- **Authorized Client IDs** and **Client Secret** are configured
- The **Authorized redirect URI** shown by Supabase (something like `https://ktpsrzznftgxkywjxiek.supabase.co/auth/v1/callback`) is added in the **Google Cloud Console** under OAuth 2.0 credentials → Authorized redirect URIs

### 4. Test
After making these changes:
1. Visit `https://dunningdog.vercel.app/login`
2. Click "Continue with Google"
3. Complete Google sign-in
4. Should land on `https://dunningdog.vercel.app/app` (dashboard)

## Files Reviewed (no code changes needed)
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
