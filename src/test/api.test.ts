import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

async function loadApi() {
  vi.resetModules();
  const captureException = vi.fn().mockResolvedValue(undefined);
  vi.doMock("@/lib/observability", () => ({ captureException }));
  const api = await import("@/lib/api");
  const problem = await import("@/lib/problem");
  return { api, captureException, ProblemError: problem.ProblemError };
}

describe("api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid JSON request bodies", async () => {
    const { api } = await loadApi();
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "Niels" }),
      headers: { "content-type": "application/json" },
    });

    const parsed = await api.parseJsonBody(request, z.object({ name: z.string() }));

    expect(parsed).toEqual({ name: "Niels" });
  });

  it("throws a validation problem when request JSON is invalid", async () => {
    const { api } = await loadApi();
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{invalid-json",
      headers: { "content-type": "application/json" },
    });

    await expect(api.parseJsonBody(request, z.object({ name: z.string() }))).rejects.toMatchObject(
      {
        status: 400,
        code: "VALIDATION_REQUEST_BODY_INVALID",
      },
    );
  });

  it("throws a validation problem when schema parsing fails", async () => {
    const { api } = await loadApi();
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: 123 }),
      headers: { "content-type": "application/json" },
    });

    await expect(api.parseJsonBody(request, z.object({ name: z.string() }))).rejects.toMatchObject(
      {
        status: 400,
        code: "VALIDATION_REQUEST_BODY_INVALID",
      },
    );
  });

  it("creates JSON responses with explicit status codes", async () => {
    const { api } = await loadApi();

    const response = api.ok({ ok: true }, 201);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns structured problem responses for known problem errors", async () => {
    const { api, captureException, ProblemError } = await loadApi();
    const problem = new ProblemError({
      title: "Bad input",
      status: 400,
      code: "VALIDATION_REQUEST_BODY_INVALID",
      detail: "Invalid payload.",
    });

    const response = api.routeError(problem, "/api/test");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("VALIDATION_REQUEST_BODY_INVALID");
    expect(captureException).not.toHaveBeenCalled();
  });

  it("captures server problem errors before returning a response", async () => {
    const { api, captureException, ProblemError } = await loadApi();
    const problem = new ProblemError({
      title: "Server blew up",
      status: 500,
      code: "INTERNAL_TEST",
      detail: "Unexpected.",
    });

    const response = api.routeError(problem, "/api/test");

    expect(response.status).toBe(500);
    expect(captureException).toHaveBeenCalledWith(
      problem,
      expect.objectContaining({
        instance: "/api/test",
        code: "INTERNAL_TEST",
        status: 500,
      }),
    );
  });

  it("captures unknown errors and returns unknown problem responses", async () => {
    const { api, captureException } = await loadApi();
    const error = new Error("boom");

    const response = api.routeError(error, "/api/test");
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe("INTERNAL_UNEXPECTED");
    expect(captureException).toHaveBeenCalledWith(error, { instance: "/api/test" });
  });
});
