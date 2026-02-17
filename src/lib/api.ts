import { z } from "zod";
import { NextResponse } from "next/server";
import { ProblemError, problemResponse, unknownProblemResponse } from "@/lib/problem";
import { captureException } from "@/lib/observability";

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const payload = await request.json().catch(() => {
    throw new ProblemError({
      title: "Invalid request body",
      status: 400,
      code: "VALIDATION_REQUEST_BODY_INVALID",
      detail: "Request body is not valid JSON.",
    });
  });

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ProblemError({
      title: "Invalid request body",
      status: 400,
      code: "VALIDATION_REQUEST_BODY_INVALID",
      detail: parsed.error.issues.map((issue) => issue.message).join("; "),
      meta: { issues: parsed.error.issues },
    });
  }

  return parsed.data;
}

export function ok<T>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}

export function routeError(error: unknown, instance: string) {
  if (error instanceof ProblemError) {
    if (error.status >= 500) {
      void captureException(error, {
        instance,
        code: error.code,
        status: error.status,
      });
    }
    return problemResponse(error, instance);
  }
  void captureException(error, { instance });
  return unknownProblemResponse(instance);
}
