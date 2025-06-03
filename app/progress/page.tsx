"use client";

import React from "react";
import { UserStrategyProgressList } from "@/components/user/UserStrategyProgressList";
import { UserOverallStats } from "@/components/user/UserOverallStats";
import { useUser } from "@/lib/contexts/user-context";
import { MainLayout } from "@/components/layout/main-layout";

export default function ProgressPage() {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </MainLayout>
    );
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
      <div className="py-6 md:py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6 md:mb-8 text-center md:text-left">
            Your Progress Dashboard
          </h1>
          {currentUser.statistics && (
            <UserOverallStats statistics={currentUser.statistics} />
          )}
        </div>
        <UserStrategyProgressList />
      </div>
    </MainLayout>
  );
}
