"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingFormProps {
  initialValues: {
    companyName: string | null;
    logoUrl: string | null;
    accentColor: string;
    footerText: string | null;
  };
}

export function BrandingForm({ initialValues }: BrandingFormProps) {
  const [companyName, setCompanyName] = useState(initialValues.companyName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialValues.logoUrl ?? "");
  const [accentColor, setAccentColor] = useState(initialValues.accentColor);
  const [footerText, setFooterText] = useState(initialValues.footerText ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings/branding", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyName, logoUrl, accentColor, footerText }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to save branding.");
      }
      setMessage("Branding saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accentColor">Accent color</Label>
          <div className="flex items-center gap-2">
            <input
              id="accentColor"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-zinc-200"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-28"
              placeholder="#10b981"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="footerText">Footer text</Label>
          <Input
            id="footerText"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Questions? Contact support@yourcompany.com"
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Email preview
        </p>
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div style={{ height: 4, backgroundColor: accentColor }} />
          <div className="p-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName || "Logo"}
                className="mb-2 max-h-10 max-w-[160px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <p className="mb-2 text-sm font-bold text-zinc-900">
                {companyName || "Your Company"}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              We could not process your recent payment...
            </p>
            <div
              className="mt-3 inline-block rounded-md px-4 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              Update payment method
            </div>
          </div>
          <div className="border-t border-zinc-100 px-4 py-2">
            <p className="text-[10px] text-zinc-400">
              Sent by {companyName || "Your Company"}
              {footerText ? ` — ${footerText}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save branding"}
        </Button>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </div>
    </form>
  );
}
