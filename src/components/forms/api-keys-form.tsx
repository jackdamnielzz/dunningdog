"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ApiKey {
  id: string;
  prefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

const SCOPE_OPTIONS = [
  { value: "read:dashboard", label: "Read dashboard" },
  { value: "read:recoveries", label: "Read recoveries" },
  { value: "read:sequences", label: "Read sequences" },
  { value: "write:sequences", label: "Write sequences" },
  { value: "read:settings", label: "Read settings" },
] as const;

export function ApiKeysForm() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>(["read:dashboard", "read:recoveries"]);
  const [saving, setSaving] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadKeys() {
    try {
      const response = await fetch("/api/settings/api-keys");
      if (response.ok) {
        setKeys(await response.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadKeys(); }, []);

  function toggleScope(scope: string) {
    setNewScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  async function handleCreate() {
    setSaving(true);
    setMessage(null);
    setCreatedKey(null);
    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: newLabel, scopes: newScopes }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to create API key.");
      }
      const result = await response.json();
      setCreatedKey(result.key);
      setNewLabel("");
      setNewScopes(["read:dashboard", "read:recoveries"]);
      setShowForm(false);
      await loadKeys();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
    setCreatedKey(null);
    await loadKeys();
  }

  async function handleCopy() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading API keys...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Created key alert */}
      {createdKey && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-semibold text-emerald-800">
            API key created — copy it now, it won&apos;t be shown again
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-3 py-2 text-xs text-zinc-800">
              {createdKey}
            </code>
            <Button size="sm" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {/* Existing keys */}
      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs text-zinc-500">{k.prefix}...</code>
                  <span className="text-sm font-medium text-zinc-900">
                    {k.label || "Unnamed key"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {k.scopes.map((scope) => (
                    <Badge key={scope} variant="neutral" className="text-[10px]">
                      {scope}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-zinc-400">
                  Created {new Date(k.createdAt).toLocaleDateString()}
                  {k.lastUsedAt
                    ? ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                    : " · Never used"}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRevoke(k.id)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showForm ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Production dashboard"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleScope(opt.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    newScopes.includes(opt.value)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving || !newLabel || newScopes.length === 0}>
              {saving ? "Creating..." : "Create API key"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          + Create API key
        </Button>
      )}

      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
