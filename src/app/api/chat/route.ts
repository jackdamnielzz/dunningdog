import { z } from "zod";
import { ProblemError } from "@/lib/problem";
import { routeError } from "@/lib/api";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(50),
});

const SYSTEM_PROMPT = `You are DunningDog's customer support assistant on the DunningDog website. DunningDog is a SaaS platform that automates payment recovery (dunning) for Stripe-based businesses.

Key information:
- Pricing: Starter $49/mo ($41/mo annual), Pro $149/mo ($125/mo annual), Scale $199/mo ($169/mo annual)
- All plans include a 7-day free trial, no credit card required
- MRR caps: Starter $10k, Pro $50k, Scale $200k
- Core features: automated pre-dunning alerts, smart retry sequences, recovery dashboard with ROI metrics
- Pro adds: email branding customization, notification channels
- Scale adds: API access, priority support
- Contact: info@dunningdog.com
- Website: https://dunningdog.com

Be helpful, concise, and friendly. Answer in the language the user writes in, but default to English. If you don't know something specific, suggest they contact info@dunningdog.com or use the contact form at dunningdog.com/contact. Never make up features or pricing that isn't listed above.`;

const instance = "/api/chat";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export async function POST(request: Request) {
  try {
    if (!env.OPENCLAW_GATEWAY_URL || !env.OPENCLAW_API_KEY) {
      throw new ProblemError({
        title: "Chatbot not configured",
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        detail: "The chatbot service is not configured.",
      });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      throw new ProblemError({
        title: "Rate limit exceeded",
        status: 429,
        code: "RATE_LIMIT_EXCEEDED",
        detail: "Too many requests. Please wait a moment before trying again.",
      });
    }

    const body = await request.json().catch(() => {
      throw new ProblemError({
        title: "Invalid request body",
        status: 400,
        code: "VALIDATION_REQUEST_BODY_INVALID",
        detail: "Request body is not valid JSON.",
      });
    });

    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      throw new ProblemError({
        title: "Invalid request body",
        status: 400,
        code: "VALIDATION_REQUEST_BODY_INVALID",
        detail: parsed.error.issues.map((i) => i.message).join("; "),
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const upstream = await fetch(env.OPENCLAW_GATEWAY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.OPENCLAW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "default",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...parsed.data.messages,
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    }).catch((err) => {
      clearTimeout(timeout);
      log("error", "OpenClaw gateway unreachable", { error: String(err) });
      throw new ProblemError({
        title: "Chatbot service unavailable",
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        detail: "The chatbot service is temporarily unavailable.",
      });
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      log("warn", "OpenClaw gateway error", { status: upstream.status });
      throw new ProblemError({
        title: "Chatbot service error",
        status: 502,
        code: "SERVICE_UNAVAILABLE",
        detail: "The chatbot service returned an error.",
      });
    }

    if (!upstream.body) {
      throw new ProblemError({
        title: "Chatbot service error",
        status: 502,
        code: "SERVICE_UNAVAILABLE",
        detail: "No response body from chatbot service.",
      });
    }

    const stream = upstream.body;

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    return routeError(error, instance);
  }
}
