import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const docLinks = [
  { href: "/docs/README.md", label: "Documentation Index", desc: "Read the full execution blueprint." },
  { href: "/docs/product/PRD.md", label: "Product PRD", desc: "Scope, goals, and acceptance criteria." },
  { href: "/docs/api/openapi.yaml", label: "OpenAPI v1", desc: "Stable API contracts for implementation." },
  { href: "/docs/security/threat-model.md", label: "Threat Model", desc: "Security baseline for MVP operations." },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-14">
      <main className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold text-zinc-900">Project Documentation</h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          These links point to repository documentation files used to define product,
          architecture, API contracts, and operations.
        </p>

        <div className="mt-8 grid gap-4">
          {docLinks.map((item) => (
            <Card key={item.href}>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-600">{item.desc}</p>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
