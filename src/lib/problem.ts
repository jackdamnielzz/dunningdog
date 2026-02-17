import { NextResponse } from "next/server";

type ProblemCode =
  | `AUTH_${string}`
  | `STRIPE_${string}`
  | `DUNNING_${string}`
  | `VALIDATION_${string}`
  | `RATE_LIMIT_${string}`
  | `INTERNAL_${string}`;

export class ProblemError extends Error {
  status: number;
  code: ProblemCode;
  detail?: string;
  meta?: Record<string, unknown>;

  constructor(params: {
    title: string;
    status: number;
    code: ProblemCode;
    detail?: string;
    meta?: Record<string, unknown>;
  }) {
    super(params.title);
    this.status = params.status;
    this.code = params.code;
    this.detail = params.detail;
    this.meta = params.meta;
  }
}

export function problemResponse(
  error: ProblemError,
  instance: string,
  traceId?: string,
) {
  return NextResponse.json(
    {
      type: `https://docs.dunningdog.com/errors/${error.code}`,
      title: error.message,
      status: error.status,
      detail: error.detail,
      instance,
      code: error.code,
      traceId: traceId ?? crypto.randomUUID(),
      meta: error.meta ?? {},
    },
    {
      status: error.status,
      headers: {
        "content-type": "application/problem+json",
      },
    },
  );
}

export function unknownProblemResponse(instance: string, traceId?: string) {
  return NextResponse.json(
    {
      type: "https://docs.dunningdog.com/errors/INTERNAL_UNEXPECTED",
      title: "Unexpected internal error",
      status: 500,
      detail: "An unexpected error occurred while processing your request.",
      instance,
      code: "INTERNAL_UNEXPECTED",
      traceId: traceId ?? crypto.randomUUID(),
      meta: {},
    },
    {
      status: 500,
      headers: {
        "content-type": "application/problem+json",
      },
    },
  );
}
