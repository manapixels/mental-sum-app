"use client";

import { useUser } from "@/lib/contexts/user-context";
import { PracticeInitializer } from "@/components/home/practice-initializer";

function PracticeSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-muted rounded"></div>
    </div>
  );
}

export function PracticeSection() {
  const { currentUser, users, isLoading } = useUser();

  // Show skeleton while loading
  if (isLoading) {
    return <PracticeSkeleton />;
  }

  // Don't show practice section if no users or no current user
  if (users.length === 0 || !currentUser) {
    return null;
  }

  return <PracticeInitializer />;
}
