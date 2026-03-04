import { CodeBlock } from "@/components/docs/code-block";
import { EndpointCard } from "@/components/docs/endpoint-card";

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-zinc-900 first:mt-0">
      {children}
    </h2>
  );
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mb-3 mt-8 scroll-mt-24 text-lg font-semibold text-zinc-900">
      {children}
    </h3>
  );
}

function Param({ name, type, required, children }: { name: string; type: string; required?: boolean; children: React.ReactNode }) {
  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="py-2 pr-3 align-top">
        <code className="text-sm font-semibold text-zinc-900">{name}</code>
        {required && <span className="ml-1 text-xs text-red-600">required</span>}
      </td>
      <td className="py-2 pr-3 align-top">
        <code className="text-xs text-zinc-500">{type}</code>
      </td>
      <td className="py-2 text-sm text-zinc-600">{children}</td>
    </tr>
  );
}

function ParamTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
            <th className="pb-2 pr-3">Parameter</th>
            <th className="pb-2 pr-3">Type</th>
            <th className="pb-2">Description</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">API Reference</h1>
        <p className="mt-2 text-lg text-zinc-600">
          Programmatic access to your DunningDog workspace data.
        </p>
      </div>

      {/* Getting Started */}
      <SectionHeading id="getting-started">Getting Started</SectionHeading>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          The DunningDog API lets you read recovery data, manage dunning sequences, and access workspace
          settings from your own applications. API access is available on the <strong>Scale plan</strong>.
        </p>
        <p>
          <strong>Base URL:</strong>{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-900">https://dunningdog.com/api</code>
        </p>
        <p>To get started:</p>
        <ol className="list-inside list-decimal space-y-1 pl-1">
          <li>Make sure you&apos;re on the Scale plan</li>
          <li>Go to <strong>Settings &rarr; API Keys</strong> in your dashboard</li>
          <li>Create a new API key with the scopes you need</li>
          <li>Copy the key immediately &mdash; it&apos;s only shown once</li>
        </ol>
      </div>

      {/* Authentication */}
      <SectionHeading id="authentication">Authentication</SectionHeading>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          Authenticate API requests by including your API key in the <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">x-api-key</code> header:
        </p>
        <CodeBlock language="bash">{`curl https://dunningdog.com/api/dashboard/summary \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>

        <p>
          API keys use the prefix <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">dd_live_</code> followed by 48 hexadecimal characters. They are hashed on our servers &mdash; we never store the raw key.
        </p>

        <h4 className="mt-6 font-semibold text-zinc-900">Scopes</h4>
        <p>
          Each API key has one or more scopes that control which endpoints it can access. Requests to an endpoint without the required scope will receive a <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">403</code> error.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="pb-2 pr-4">Scope</th>
                <th className="pb-2 pr-4">Access</th>
                <th className="pb-2">Endpoints</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4"><code className="text-xs">read:dashboard</code></td>
                <td className="py-2 pr-4">Dashboard metrics</td>
                <td className="py-2"><code className="text-xs">GET /api/dashboard/summary</code></td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4"><code className="text-xs">read:recoveries</code></td>
                <td className="py-2 pr-4">Recovery data &amp; export</td>
                <td className="py-2">
                  <code className="text-xs">GET /api/dashboard/recoveries</code><br />
                  <code className="text-xs">GET /api/dashboard/export</code>
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4"><code className="text-xs">read:sequences</code></td>
                <td className="py-2 pr-4">Read sequences</td>
                <td className="py-2"><code className="text-xs">GET /api/dunning/sequences</code></td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4"><code className="text-xs">write:sequences</code></td>
                <td className="py-2 pr-4">Create &amp; update sequences</td>
                <td className="py-2">
                  <code className="text-xs">POST /api/dunning/sequences</code><br />
                  <code className="text-xs">PATCH /api/dunning/sequences/:id</code>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="text-xs">read:settings</code></td>
                <td className="py-2 pr-4">Workspace settings</td>
                <td className="py-2">
                  <code className="text-xs">GET /api/settings/branding</code><br />
                  <code className="text-xs">GET /api/settings/notifications</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            <strong>Security:</strong> API keys grant access to your workspace data. Keep them secret. Never expose them in client-side code, public repositories, or browser requests. Use API keys exclusively from server-side applications.
          </p>
        </div>
      </div>

      {/* Errors */}
      <SectionHeading id="errors">Error Format</SectionHeading>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          All errors follow the <a href="https://www.rfc-editor.org/rfc/rfc7807" className="font-medium text-accent-700 underline underline-offset-2" target="_blank" rel="noopener noreferrer">RFC 7807</a> Problem+JSON format:
        </p>
        <CodeBlock language="json">{`{
  "type": "https://docs.dunningdog.com/errors/AUTH_FORBIDDEN",
  "title": "Insufficient API key permissions",
  "status": 403,
  "code": "AUTH_FORBIDDEN",
  "detail": "This API key lacks the required scope(s): read:dashboard.",
  "instance": "/api/dashboard/summary",
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "meta": {}
}`}</CodeBlock>

        <h4 className="mt-6 font-semibold text-zinc-900">Common Error Codes</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Code</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">401</td>
                <td className="py-2 pr-4"><code className="text-xs">AUTH_UNAUTHORIZED</code></td>
                <td className="py-2">Invalid or missing API key</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">403</td>
                <td className="py-2 pr-4"><code className="text-xs">AUTH_FORBIDDEN</code></td>
                <td className="py-2">API key lacks required scope or plan feature</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">403</td>
                <td className="py-2 pr-4"><code className="text-xs">FEATURE_NOT_AVAILABLE</code></td>
                <td className="py-2">Feature not included in your billing plan</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">403</td>
                <td className="py-2 pr-4"><code className="text-xs">TRIAL_EXPIRED</code></td>
                <td className="py-2">Workspace trial has ended</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">400</td>
                <td className="py-2 pr-4"><code className="text-xs">VALIDATION_REQUEST_BODY_INVALID</code></td>
                <td className="py-2">Request body failed validation</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">404</td>
                <td className="py-2 pr-4"><code className="text-xs">AUTH_FORBIDDEN</code></td>
                <td className="py-2">Resource not found or not accessible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limits */}
      <SectionHeading id="rate-limits">Rate Limits</SectionHeading>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
        <p>
          API requests are rate-limited to <strong>100 requests per minute</strong> per API key.
          If you exceed this limit, you&apos;ll receive a <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">429</code> response
          with a <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">Retry-After</code> header indicating how many seconds to wait.
        </p>
        <CodeBlock language="json">{`{
  "type": "https://docs.dunningdog.com/errors/RATE_LIMIT_EXCEEDED",
  "title": "Rate limit exceeded",
  "status": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "detail": "Too many requests. Retry after 12 seconds."
}`}</CodeBlock>
      </div>

      {/* Endpoints */}
      <SectionHeading id="endpoints">Endpoint Reference</SectionHeading>

      {/* GET /api/dashboard/summary */}
      <SubHeading id="get-dashboard-summary">Get Dashboard Summary</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/dashboard/summary"
        scope="read:dashboard"
        description="Returns aggregated recovery metrics for your workspace, including failed and recovered revenue, recovery rate, active sequences, and at-risk subscriptions."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Query Parameters</h5>
        <ParamTable>
          <Param name="window" type="string">
            Time window. One of <code className="text-xs">7d</code>, <code className="text-xs">30d</code>, <code className="text-xs">90d</code>, <code className="text-xs">month</code>, <code className="text-xs">lifetime</code>. Default: <code className="text-xs">month</code>.
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl https://dunningdog.com/api/dashboard/summary?window=30d \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response</h5>
        <CodeBlock language="json">{`{
  "workspaceId": "ws_abc123",
  "window": "30d",
  "failedRevenueCents": 125000,
  "recoveredRevenueCents": 87500,
  "recoveryRate": 0.7,
  "atRiskCount": 3,
  "activeSequences": 2,
  "generatedAt": "2026-03-04T12:00:00.000Z",
  "latestSnapshot": {
    "id": "snap_1",
    "workspaceId": "ws_abc123",
    "periodStart": "2026-02-01T00:00:00.000Z",
    "periodEnd": "2026-03-01T00:00:00.000Z",
    "failedRevenueCents": 200000,
    "recoveredRevenueCents": 140000,
    "recoveryRate": 0.7,
    "atRiskCount": 5,
    "generatedAt": "2026-03-01T00:05:00.000Z"
  },
  "atRiskPreview": []
}`}</CodeBlock>
      </EndpointCard>

      {/* GET /api/dashboard/recoveries */}
      <SubHeading id="list-recoveries">List Recovery Attempts</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/dashboard/recoveries"
        scope="read:recoveries"
        description="Returns a paginated list of recovery attempts for your workspace. Each item includes the recovery attempt details and the latest outcome."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Query Parameters</h5>
        <ParamTable>
          <Param name="status" type="string">
            Filter by status: <code className="text-xs">pending</code>, <code className="text-xs">recovered</code>, <code className="text-xs">failed</code>, or <code className="text-xs">abandoned</code>.
          </Param>
          <Param name="limit" type="integer">
            Number of results (1&ndash;100). Default: 20.
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl "https://dunningdog.com/api/dashboard/recoveries?status=recovered&limit=5" \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response</h5>
        <CodeBlock language="json">{`{
  "items": [
    {
      "attempt": {
        "id": "ra_1",
        "workspaceId": "ws_abc123",
        "stripeInvoiceId": "in_1abc",
        "stripeCustomerId": "cus_xyz",
        "declineType": "soft",
        "status": "recovered",
        "amountDueCents": 4999,
        "recoveredAmountCents": 4999,
        "startedAt": "2026-02-15T10:00:00.000Z",
        "endedAt": "2026-02-17T08:30:00.000Z"
      },
      "latestOutcome": {
        "id": "ro_1",
        "workspaceId": "ws_abc123",
        "recoveryAttemptId": "ra_1",
        "outcome": "recovered",
        "reasonCode": null,
        "occurredAt": "2026-02-17T08:30:00.000Z"
      }
    }
  ],
  "nextCursor": null
}`}</CodeBlock>
      </EndpointCard>

      {/* GET /api/dashboard/export */}
      <SubHeading id="export-recoveries">Export Recoveries (CSV)</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/dashboard/export"
        scope="read:recoveries"
        description="Downloads recovery attempts as a CSV file. Useful for importing data into spreadsheets or BI tools."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Query Parameters</h5>
        <ParamTable>
          <Param name="startDate" type="string">
            ISO 8601 date (e.g. <code className="text-xs">2026-01-01</code>). Defaults to 30 days before endDate.
          </Param>
          <Param name="endDate" type="string">
            ISO 8601 date. Defaults to today.
          </Param>
          <Param name="status" type="string">
            Filter by status: <code className="text-xs">pending</code>, <code className="text-xs">recovered</code>, <code className="text-xs">failed</code>, or <code className="text-xs">abandoned</code>.
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl "https://dunningdog.com/api/dashboard/export?startDate=2026-02-01&endDate=2026-03-01" \\
  -H "x-api-key: dd_live_your_key_here" \\
  -o recoveries.csv`}</CodeBlock>
        <p className="mt-3 text-sm text-zinc-600">
          The response has <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">Content-Type: text/csv</code> and a <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">Content-Disposition</code> header with the filename.
        </p>
      </EndpointCard>

      {/* GET /api/dunning/sequences */}
      <SubHeading id="list-sequences">List Dunning Sequences</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/dunning/sequences"
        scope="read:sequences"
        description="Returns all dunning sequences for your workspace, including their steps ordered by position."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl https://dunningdog.com/api/dunning/sequences \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response</h5>
        <CodeBlock language="json">{`{
  "items": [
    {
      "id": "seq_1",
      "workspaceId": "ws_abc123",
      "name": "Default Recovery",
      "isEnabled": true,
      "steps": [
        {
          "id": "step_1",
          "delayHours": 0,
          "subjectTemplate": "Your payment failed",
          "bodyTemplate": "Hi {{customerName}}, we couldn't process your payment...",
          "status": "scheduled"
        },
        {
          "id": "step_2",
          "delayHours": 72,
          "subjectTemplate": "Reminder: update your payment method",
          "bodyTemplate": "Hi {{customerName}}, this is a friendly reminder...",
          "status": "scheduled"
        }
      ],
      "createdAt": "2026-01-15T09:00:00.000Z",
      "updatedAt": "2026-02-20T14:30:00.000Z"
    }
  ]
}`}</CodeBlock>
      </EndpointCard>

      {/* POST /api/dunning/sequences */}
      <SubHeading id="create-sequence">Create Dunning Sequence</SubHeading>
      <EndpointCard
        method="POST"
        path="/api/dunning/sequences"
        scope="write:sequences"
        description="Creates a new dunning sequence with one or more email steps. The maximum number of steps depends on your plan."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Body</h5>
        <ParamTable>
          <Param name="workspaceId" type="string" required>
            Your workspace ID.
          </Param>
          <Param name="name" type="string" required>
            Name for the sequence.
          </Param>
          <Param name="isEnabled" type="boolean" required>
            Whether the sequence should be active.
          </Param>
          <Param name="steps" type="array" required>
            Array of step objects, each with <code className="text-xs">delayHours</code> (integer, hours after previous step), <code className="text-xs">subjectTemplate</code> (string), and <code className="text-xs">bodyTemplate</code> (string).
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl -X POST https://dunningdog.com/api/dunning/sequences \\
  -H "x-api-key: dd_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workspaceId": "ws_abc123",
    "name": "Gentle Recovery",
    "isEnabled": true,
    "steps": [
      {
        "delayHours": 0,
        "subjectTemplate": "Action needed: payment failed",
        "bodyTemplate": "Hi {{customerName}}, your payment of {{amount}} could not be processed..."
      },
      {
        "delayHours": 48,
        "subjectTemplate": "Reminder: please update your payment method",
        "bodyTemplate": "Hi {{customerName}}, we still need your updated payment details..."
      }
    ]
  }'`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response (201)</h5>
        <CodeBlock language="json">{`{
  "id": "seq_new1",
  "workspaceId": "ws_abc123",
  "name": "Gentle Recovery",
  "isEnabled": true,
  "steps": [
    {
      "id": "step_a",
      "delayHours": 0,
      "subjectTemplate": "Action needed: payment failed",
      "bodyTemplate": "Hi {{customerName}}, your payment of {{amount}} could not be processed...",
      "status": "scheduled"
    },
    {
      "id": "step_b",
      "delayHours": 48,
      "subjectTemplate": "Reminder: please update your payment method",
      "bodyTemplate": "Hi {{customerName}}, we still need your updated payment details...",
      "status": "scheduled"
    }
  ],
  "createdAt": "2026-03-04T10:00:00.000Z",
  "updatedAt": "2026-03-04T10:00:00.000Z"
}`}</CodeBlock>
      </EndpointCard>

      {/* PATCH /api/dunning/sequences/:id */}
      <SubHeading id="update-sequence">Update Dunning Sequence</SubHeading>
      <EndpointCard
        method="PATCH"
        path="/api/dunning/sequences/:id"
        scope="write:sequences"
        description="Updates an existing dunning sequence. You can change the name, enabled status, or replace the steps entirely. All fields are optional."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Path Parameters</h5>
        <ParamTable>
          <Param name="id" type="string" required>
            Sequence ID.
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Body</h5>
        <ParamTable>
          <Param name="name" type="string">
            New name.
          </Param>
          <Param name="isEnabled" type="boolean">
            Enable or disable.
          </Param>
          <Param name="steps" type="array">
            Replace all steps. Each object: <code className="text-xs">id</code> (optional, for existing steps), <code className="text-xs">delayHours</code>, <code className="text-xs">subjectTemplate</code>, <code className="text-xs">bodyTemplate</code>.
          </Param>
        </ParamTable>
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl -X PATCH https://dunningdog.com/api/dunning/sequences/seq_1 \\
  -H "x-api-key: dd_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "isEnabled": false }'`}</CodeBlock>
      </EndpointCard>

      {/* GET /api/settings/branding */}
      <SubHeading id="get-branding">Get Workspace Branding</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/settings/branding"
        scope="read:settings"
        description="Returns the branding settings for your workspace, including company name, logo URL, accent color, and email footer text."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl https://dunningdog.com/api/settings/branding \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response</h5>
        <CodeBlock language="json">{`{
  "companyName": "Acme Inc",
  "logoUrl": "https://example.com/logo.png",
  "accentColor": "#10b981",
  "footerText": "Acme Inc - Powered by DunningDog"
}`}</CodeBlock>
      </EndpointCard>

      {/* GET /api/settings/notifications */}
      <SubHeading id="list-notifications">List Notification Channels</SubHeading>
      <EndpointCard
        method="GET"
        path="/api/settings/notifications"
        scope="read:settings"
        description="Returns the configured notification channels (Slack or Discord webhooks) for your workspace."
      >
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Request</h5>
        <CodeBlock language="bash">{`curl https://dunningdog.com/api/settings/notifications \\
  -H "x-api-key: dd_live_your_key_here"`}</CodeBlock>
        <h5 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Example Response</h5>
        <CodeBlock language="json">{`[
  {
    "id": "nc_1",
    "workspaceId": "ws_abc123",
    "type": "slack",
    "label": "Recovery alerts",
    "webhookUrl": "https://hooks.slack.com/services/T.../B.../xxx",
    "events": ["recovery_started", "recovery_succeeded", "recovery_failed"],
    "createdAt": "2026-02-01T12:00:00.000Z"
  }
]`}</CodeBlock>
      </EndpointCard>

      {/* Footer */}
      <div className="mt-16 border-t border-zinc-200 pt-8">
        <p className="text-sm text-zinc-500">
          Need help? Contact us at{" "}
          <a href="mailto:info@dunningdog.com" className="font-medium text-accent-700 underline underline-offset-2">
            info@dunningdog.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
