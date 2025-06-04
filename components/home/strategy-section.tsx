"use client";

import { useUser } from "@/lib/contexts/user-context";
import { StrategyDashboard } from "@/components/user/strategy-dashboard";

function StrategySkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function StrategySection() {
  const { currentUser, users, isLoading } = useUser();

  // Show skeleton while loading
  if (isLoading) {
    return <StrategySkeleton />;
  }

  // Don't show strategy section if no users or no current user
  if (users.length === 0 || !currentUser) {
    return null;
  }

  return <StrategyDashboard />;
}
