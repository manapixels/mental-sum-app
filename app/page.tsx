"use client";

import React from "react";
import { UserStrategyProgressList } from "@/components/user/UserStrategyProgressList";
import { UserOverallStats } from "@/components/user/UserOverallStats";
import { useUser } from "@/lib/contexts/user-context";
import { MainLayout } from "@/components/layout/main-layout";
import { PracticeInitializer } from "@/components/home/practice-initializer";
import { WelcomeScreen } from "@/components/user/user-selector";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const { currentUser, users, isLoading } = useUser();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </MainLayout>
    );
  }

  // Show welcome screen if no users exist
  if (users.length === 0) {
    return <WelcomeScreen />;
  }

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">View Your Progress</h1>
          <p className="text-muted-foreground">
            Please select or create a user profile to view your progress.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative">
        <div className="space-y-8 relative z-10">
          <div>
            {currentUser.statistics && (
              <UserOverallStats statistics={currentUser.statistics} />
            )}
          </div>
          <PracticeInitializer />
          <Separator />
          <UserStrategyProgressList />
        </div>
      </div>
    </MainLayout>
  );
}
