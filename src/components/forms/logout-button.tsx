"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton({
  variant = "outline",
  redirectTo = "/login",
}: {
  variant?: "outline" | "ghost" | "default";
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
