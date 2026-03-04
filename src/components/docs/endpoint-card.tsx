import { Badge } from "@/components/ui/badge";

interface EndpointCardProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  scope: string;
  description: string;
  children: React.ReactNode;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800",
  POST: "bg-blue-100 text-blue-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

export function EndpointCard({ method, path, scope, description, children }: EndpointCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3 sm:px-6">
        <span className={`inline-flex rounded-md px-2.5 py-1 font-mono text-xs font-bold ${methodColors[method]}`}>
          {method}
        </span>
        <code className="font-mono text-sm font-semibold text-zinc-900">{path}</code>
        <Badge variant="neutral" className="ml-auto text-xs">
          {scope}
        </Badge>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <p className="mb-4 text-sm text-zinc-600">{description}</p>
        {children}
      </div>
    </div>
  );
}
