import { promises as fs } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";

interface DocFilePageProps {
  params: Promise<{ slug: string[] }>;
}

function resolveDocPath(slug: string[]) {
  const docsRoot = path.join(process.cwd(), "docs");
  const rawPath = path.join(docsRoot, ...slug);
  const normalized = path.normalize(rawPath);
  if (!normalized.startsWith(docsRoot)) {
    return null;
  }
  return normalized;
}

export default async function DocFilePage({ params }: DocFilePageProps) {
  const { slug } = await params;
  const filePath = resolveDocPath(slug);
  if (!filePath) notFound();

  const fileExists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  if (!fileExists) notFound();

  const content = await fs.readFile(filePath, "utf8");

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto max-w-5xl rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">
          docs/{slug.join("/")}
        </h1>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 text-sm leading-6 text-zinc-100">
          {content}
        </pre>
      </main>
    </div>
  );
}
