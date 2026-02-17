import { beforeEach, describe, expect, it, vi } from "vitest";

type LoadAuthOptions = {
  authConfigured: boolean;
  demoMode?: boolean;
  userId?: string | null;
  membershipWorkspaceId?: string | null;
  firstWorkspaceId?: string | null;
};

async function loadAuth(options: LoadAuthOptions) {
  vi.resetModules();

  const mockGetUser = vi.fn();
  const mockFindUniqueMembership = vi.fn();
  const mockFindFirstMembership = vi.fn();
  const mockWorkspaceCreate = vi.fn();
  const mockWorkspaceFindUnique = vi.fn();

  mockGetUser.mockResolvedValue({
    data: options.userId ? { user: { id: options.userId } } : { user: null },
    error: options.userId ? null : { message: "unauthorized" },
  });

  mockFindUniqueMembership.mockResolvedValue(
    options.membershipWorkspaceId
      ? {
          workspace: {
            id: options.membershipWorkspaceId,
            name: "Existing Workspace",
            ownerUserId: options.userId ?? "user",
            timezone: "UTC",
            billingPlan: "starter",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }
      : null,
  );

  mockFindFirstMembership.mockResolvedValue(
    options.firstWorkspaceId
      ? {
          workspace: {
            id: options.firstWorkspaceId,
            name: "First Workspace",
            ownerUserId: options.userId ?? "user",
            timezone: "UTC",
            billingPlan: "starter",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }
      : null,
  );

  mockWorkspaceCreate.mockImplementation(async ({ data }: { data: { name: string; ownerUserId: string } }) => ({
    id: "ws_created",
    name: data.name,
    ownerUserId: data.ownerUserId,
    timezone: "UTC",
    billingPlan: "starter",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  mockWorkspaceFindUnique.mockResolvedValue({
    id: "ws_demo_default",
    name: "Demo Workspace",
    ownerUserId: "demo-owner",
    timezone: "UTC",
    billingPlan: "starter",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  vi.doMock("@/lib/env", () => ({
    env: {
      SUPABASE_URL: options.authConfigured ? "https://demo.supabase.co" : undefined,
      SUPABASE_ANON_KEY: options.authConfigured ? "anon" : undefined,
    },
    isDemoMode: options.demoMode ?? false,
  }));

  vi.doMock("@/lib/supabase", () => ({
    createSupabaseClient: () => ({
      auth: {
        getUser: mockGetUser,
      },
    }),
  }));

  vi.doMock("@/lib/db", () => ({
    db: {
      workspace: {
        findUnique: mockWorkspaceFindUnique,
        create: mockWorkspaceCreate,
      },
      workspaceMember: {
        findUnique: mockFindUniqueMembership,
        findFirst: mockFindFirstMembership,
      },
    },
  }));

  vi.doMock("@/lib/runtime-fallback", () => ({
    isDatabaseUnavailableError: vi.fn(() => false),
    describeFailure: vi.fn(() => "db unavailable"),
  }));

  vi.doMock("@/lib/demo-data", () => ({
    getDemoWorkspace: vi.fn((workspaceId: string) => ({
      id: workspaceId,
      name: "Demo Workspace",
      ownerUserId: "demo-owner",
      timezone: "UTC",
      billingPlan: "starter",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  }));

  vi.doMock("@/lib/logger", () => ({
    log: vi.fn(),
  }));

  const auth = await import("@/lib/auth");

  return {
    auth,
    mockGetUser,
    mockFindUniqueMembership,
    mockFindFirstMembership,
    mockWorkspaceCreate,
  };
}

describe("auth workspace resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication when Supabase auth is configured", async () => {
    const { auth } = await loadAuth({
      authConfigured: true,
      userId: null,
    });

    await expect(
      auth.resolveWorkspaceContextFromHeaders(new Headers()),
    ).rejects.toMatchObject({
      code: "AUTH_UNAUTHORIZED",
      status: 401,
    });
  });

  it("resolves the requested workspace when the user is a member", async () => {
    const { auth, mockFindUniqueMembership } = await loadAuth({
      authConfigured: true,
      userId: "user_1",
      membershipWorkspaceId: "ws_member",
    });

    const headers = new Headers({
      authorization: "Bearer token_123",
    });

    const context = await auth.resolveWorkspaceContextFromHeaders(headers, "ws_member");

    expect(context.workspaceId).toBe("ws_member");
    expect(context.source).toBe("authenticated");
    expect(mockFindUniqueMembership).toHaveBeenCalledTimes(1);
  });

  it("creates a workspace for a new authenticated user with no memberships", async () => {
    const { auth, mockFindFirstMembership, mockWorkspaceCreate } = await loadAuth({
      authConfigured: true,
      userId: "user_new_1234",
      membershipWorkspaceId: null,
      firstWorkspaceId: null,
    });

    const headers = new Headers({
      authorization: "Bearer token_456",
    });

    const context = await auth.resolveWorkspaceContextFromHeaders(headers);

    expect(context.workspaceId).toBe("ws_created");
    expect(mockFindFirstMembership).toHaveBeenCalledTimes(1);
    expect(mockWorkspaceCreate).toHaveBeenCalledTimes(1);
  });

  it("falls back to demo workspace when auth is not configured", async () => {
    const { auth } = await loadAuth({
      authConfigured: false,
      userId: null,
    });

    const context = await auth.resolveWorkspaceContextFromHeaders(new Headers());

    expect(context.workspaceId).toBe("ws_demo_default");
    expect(context.source).toBe("fallback");
  });
});
