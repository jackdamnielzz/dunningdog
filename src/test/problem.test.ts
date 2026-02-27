import { describe, expect, it } from "vitest";

import { ProblemError, problemResponse, unknownProblemResponse } from "@/lib/problem";

describe("problem responses", () => {
  it("builds a problem+json response with defaults", async () => {
    const error = new ProblemError({
      title: "Validation failed",
      status: 422,
      code: "VALIDATION_INPUT",
      detail: "Missing field",
      meta: { field: "email" },
    });

    const response = problemResponse(error, "/api/test", "trace_123");
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(body).toEqual(
      expect.objectContaining({
        type: "https://docs.dunningdog.com/errors/VALIDATION_INPUT",
        title: "Validation failed",
        status: 422,
        detail: "Missing field",
        instance: "/api/test",
        code: "VALIDATION_INPUT",
        traceId: "trace_123",
        meta: { field: "email" },
      }),
    );
  });

  it("generates a traceId when not provided", async () => {
    const error = new ProblemError({
      title: "Unauthorized",
      status: 401,
      code: "AUTH_UNAUTHORIZED",
    });

    const response = problemResponse(error, "/api/auth");
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.traceId).toEqual(expect.any(String));
    expect(body.meta).toEqual({});
  });

  it("returns a standard unknown problem response", async () => {
    const response = unknownProblemResponse("/api/unknown", "trace_unknown");
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual(
      expect.objectContaining({
        type: "https://docs.dunningdog.com/errors/INTERNAL_UNEXPECTED",
        title: "Unexpected internal error",
        status: 500,
        detail: "An unexpected error occurred while processing your request.",
        instance: "/api/unknown",
        code: "INTERNAL_UNEXPECTED",
        traceId: "trace_unknown",
        meta: {},
      }),
    );
  });
});
