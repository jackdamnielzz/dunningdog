"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "authentication", label: "Authentication" },
  { id: "errors", label: "Error Format" },
  { id: "rate-limits", label: "Rate Limits" },
  { id: "endpoints", label: "Endpoints" },
  { id: "get-dashboard-summary", label: "Get Dashboard Summary", indent: true },
  { id: "list-recoveries", label: "List Recoveries", indent: true },
  { id: "export-recoveries", label: "Export Recoveries (CSV)", indent: true },
  { id: "list-sequences", label: "List Sequences", indent: true },
  { id: "create-sequence", label: "Create Sequence", indent: true },
  { id: "update-sequence", label: "Update Sequence", indent: true },
  { id: "get-branding", label: "Get Branding", indent: true },
  { id: "list-notifications", label: "List Notifications", indent: true },
];

export function DocsSidebar() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-20 hidden h-fit w-56 shrink-0 lg:block" aria-label="Documentation sections">
      <ul className="space-y-0.5 border-l border-zinc-200">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`block border-l-2 py-1 text-sm transition-colors ${
                section.indent ? "pl-6" : "pl-4"
              } ${
                activeId === section.id
                  ? "border-accent-600 font-medium text-accent-700"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
