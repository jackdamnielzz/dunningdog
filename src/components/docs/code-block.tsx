"use client";

import { useState } from "react";

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative rounded-lg border border-zinc-200 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        {language && (
          <span className="font-mono text-xs text-zinc-400">{language}</span>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-relaxed text-zinc-100">
          {children}
        </code>
      </pre>
    </div>
  );
}
