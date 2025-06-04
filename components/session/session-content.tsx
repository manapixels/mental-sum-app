"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionInterface } from "./session-interface";
import { useUser } from "@/lib/contexts/user-context";

export function SessionContent() {
  const router = useRouter();
  const { currentUser, isLoading: userLoading } = useUser();

  useEffect(() => {
    // Only redirect if no user after loading is complete
    if (!userLoading && !currentUser) {
      router.replace("/");
      return;
    }
  }, [currentUser, userLoading, router]);

  // Show nothing while loading user data
  if (userLoading) {
    return null;
  }

  // Redirect if no user (after loading is complete)
  if (!currentUser) {
    return null; // Will redirect via useEffect
  }

  // Let SessionInterface handle session logic (including auto-starting)
  return <SessionInterface />;
}
