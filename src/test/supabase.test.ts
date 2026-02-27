import { describe, expect, it, vi } from "vitest";

type EnvOverrides = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

async function loadSupabase(overrides: EnvOverrides = {}) {
  vi.resetModules();

  const createClient = vi.fn().mockReturnValue({ kind: "supabase-client" });

  vi.doMock("@supabase/supabase-js", () => ({
    createClient,
  }));

  vi.doMock("@/lib/env", () => ({
    env: {
      SUPABASE_URL: overrides.SUPABASE_URL,
      SUPABASE_ANON_KEY: overrides.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: overrides.SUPABASE_SERVICE_ROLE_KEY,
    },
  }));

  const supabase = await import("@/lib/supabase");

  return { supabase, createClient };
}

describe("supabase client wrappers", () => {
  it("returns null for public client when url or anon key is missing", async () => {
    const { supabase, createClient } = await loadSupabase({
      SUPABASE_URL: undefined,
      SUPABASE_ANON_KEY: "anon",
    });

    expect(supabase.createSupabaseClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates a public client when url and anon key exist", async () => {
    const { supabase, createClient } = await loadSupabase({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_ANON_KEY: "anon_key",
    });

    const client = supabase.createSupabaseClient();

    expect(client).toEqual({ kind: "supabase-client" });
    expect(createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "anon_key",
    );
  });

  it("returns null for admin client when service role key is missing", async () => {
    const { supabase, createClient } = await loadSupabase({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: undefined,
    });

    expect(supabase.createSupabaseAdminClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("creates an admin client with non-persistent auth options", async () => {
    const { supabase, createClient } = await loadSupabase({
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service_key",
    });

    const client = supabase.createSupabaseAdminClient();

    expect(client).toEqual({ kind: "supabase-client" });
    expect(createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "service_key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  });
});
