"use client";

import { useUser } from "@/lib/contexts/user-context";
import { UserOverallStats } from "@/components/user/user-overall-stats";
import { WelcomeScreen } from "@/components/user/user-selector";

function UserStatsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-muted rounded"></div>
        <div className="h-24 bg-muted rounded"></div>
        <div className="h-24 bg-muted rounded"></div>
      </div>
    </div>
  );
}

function SelectUserPrompt() {
  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-bold mb-4">View Your Progress</h1>
      <p className="text-muted-foreground">
        Please select or create a user profile to view your progress.
      </p>
    </div>
  );
}

export function UserStatsSection() {
  const { currentUser, users, isLoading } = useUser();

  if (isLoading) {
    return <UserStatsSkeleton />;
  }

  // Show welcome screen if no users exist - this takes over the whole page
  if (users.length === 0) {
    return <WelcomeScreen />;
  }

  if (!currentUser) {
    return <SelectUserPrompt />;
  }

  return (
    <div>
      {currentUser.statistics && (
        <UserOverallStats statistics={currentUser.statistics} />
      )}
    </div>
  );
}
