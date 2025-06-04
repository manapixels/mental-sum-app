"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionInterface } from "./session-interface";
import { useSession } from "@/lib/contexts/session-context";
import { useUser } from "@/lib/contexts/user-context";

export function SessionContent() {
  const router = useRouter();
  const { currentUser, isLoading: userLoading } = useUser();
  const { currentSession, isActive } = useSession();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (userLoading) return;

    // Redirect if no user
    if (!currentUser) {
      router.replace("/");
      return;
    }

    // Redirect if no active session or session is completed
    if (!currentSession || !isActive || currentSession.completed) {
      router.replace("/");
      return;
    }
  }, [currentUser, userLoading, currentSession, isActive, router]);

  // Show nothing while loading or redirecting
  if (
    userLoading ||
    !currentUser ||
    !currentSession ||
    !isActive ||
    currentSession.completed
  ) {
    return null;
  }

  return <SessionInterface />;
}
