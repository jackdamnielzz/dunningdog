import { Inngest, InngestMiddleware } from "inngest";
import { captureException } from "@/lib/observability";

const sentryMiddleware = new InngestMiddleware({
  name: "Sentry Error Reporter",
  init() {
    return {
      onFunctionRun({ ctx }) {
        return {
          transformOutput({ result }) {
            if (result.error) {
              captureException(result.error, {
                runId: ctx.runId,
                eventName: ctx.event.name,
              });
            }
          },
        };
      },
    };
  },
});

export const inngest = new Inngest({
  id: "dunningdog",
  name: "DunningDog",
  middleware: [sentryMiddleware],
  // Functions are auto-synced on deploy via the Inngest Vercel Integration.
});
