"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";
import { ChipToggleGroup } from "@/components/ui/chip-toggle";

interface Channel {
  id: string;
  type: "slack" | "discord";
  label: string;
  webhookUrl: string;
  events: string[];
  isEnabled: boolean;
}

const EVENT_OPTIONS = [
  { value: "recovery_started", label: "Recovery started" },
  { value: "recovery_succeeded", label: "Payment recovered" },
  { value: "recovery_failed", label: "Recovery failed" },
  { value: "predunning_sent", label: "Pre-dunning sent" },
] as const;

export function NotificationChannelsForm() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New channel form state
  const [newType, setNewType] = useState<"slack" | "discord">("slack");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["recovery_succeeded"]);
  const [saving, setSaving] = useState(false);

  async function loadChannels() {
    try {
      const response = await fetch("/api/settings/notifications");
      if (response.ok) {
        setChannels(await response.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChannels(); }, []);

  function toggleEvent(event: string) {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  async function handleCreate() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: newType,
          label: newLabel,
          webhookUrl: newUrl,
          events: newEvents,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail ?? "Failed to create channel.");
      }
      setNewLabel("");
      setNewUrl("");
      setNewEvents(["recovery_succeeded"]);
      setShowForm(false);
      setMessage({ type: "success", text: "Channel added successfully." });
      await loadChannels();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/settings/notifications/${id}`, { method: "DELETE" });
    await loadChannels();
  }

  async function handleTest(id: string) {
    setMessage(null);
    const response = await fetch(`/api/settings/notifications/${id}`, { method: "POST" });
    const result = await response.json();
    setMessage(result.success
      ? { type: "success", text: "Test notification sent!" }
      : { type: "error", text: "Test failed — check your webhook URL." });
  }

  async function handleToggle(id: string, isEnabled: boolean) {
    await fetch(`/api/settings/notifications/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isEnabled: !isEnabled }),
    });
    await loadChannels();
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading notification channels...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Existing channels */}
      {channels.length > 0 && (
        <div className="space-y-2">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ch.type === "slack" ? "neutral" : "neutral"}>
                    {ch.type === "slack" ? "Slack" : "Discord"}
                  </Badge>
                  <span className="text-sm font-medium text-zinc-900">
                    {ch.label || "Unnamed channel"}
                  </span>
                  <Badge variant={ch.isEnabled ? "success" : "warning"}>
                    {ch.isEnabled ? "Active" : "Paused"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">
                  Events: {ch.events.map((e) => e.replace(/_/g, " ")).join(", ")}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleTest(ch.id)}>
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(ch.id, ch.isEnabled)}
                >
                  {ch.isEnabled ? "Pause" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(ch.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add channel form */}
      {showForm ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "slack" | "discord")}
              >
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., #billing-alerts"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Webhook URL</Label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={
                newType === "slack"
                  ? "https://hooks.slack.com/services/..."
                  : "https://discord.com/api/webhooks/..."
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Events</Label>
            <ChipToggleGroup
              options={EVENT_OPTIONS}
              selected={newEvents}
              onToggle={toggleEvent}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving || !newUrl || newEvents.length === 0}>
              {saving ? "Adding..." : "Add channel"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          + Add notification channel
        </Button>
      )}

      {message && <Alert variant={message.type === "success" ? "success" : "error"}>{message.text}</Alert>}
    </div>
  );
}
