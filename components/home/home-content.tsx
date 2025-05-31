"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Settings, BarChart3, Brain } from "lucide-react";
import { WelcomeScreen } from "@/components/user/user-selector";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useUser } from "@/lib/contexts/user-context";
import { useRouter } from "next/navigation";

export function HomeContent() {
  const { currentUser, users, isLoading } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const handleStartSession = () => {
    // Navigate to session page
    router.push("/session");
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show welcome screen if no users exist
  if (users.length === 0) {
    return <WelcomeScreen />;
  }

  // Show main content with user stats
  const stats = currentUser?.statistics || {
    totalProblems: 0,
    correctAnswers: 0,
    totalSessions: 0,
  };

  const accuracyRate =
    stats.totalProblems > 0
      ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
      : 0;

  // Get enabled operations for display
  const enabledOps = currentUser?.preferences?.enabledOperations;
  const enabledOperationsList = enabledOps
    ? Object.entries(enabledOps)
        .filter(([, enabled]) => enabled)
        .map(([op]) => op.charAt(0).toUpperCase() + op.slice(1))
    : [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {currentUser
              ? `Welcome back, ${currentUser.name}!`
              : "Train Your Mental Math Skills"}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your calculation speed and accuracy through targeted
            practice sessions. Master mental strategies for addition,
            subtraction, multiplication, and division.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalProblems}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Problems Solved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {accuracyRate}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Accuracy Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Sessions Completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <Card className="p-4 sm:p-8">
          <CardHeader className="text-center pb-4 sm:pb-6 px-0">
            <CardTitle className="text-xl sm:text-2xl">
              Ready to Practice?
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Start a new session with{" "}
              {currentUser?.preferences?.sessionLength || 10} problems.
              Customize your practice settings anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 px-0">
            <div className="flex flex-wrap justify-center gap-2">
              {enabledOperationsList.length > 0 ? (
                enabledOperationsList.map((op) => (
                  <Badge
                    key={op}
                    variant="secondary"
                    className="text-xs sm:text-sm"
                  >
                    {op}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Addition
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Subtraction
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Multiplication
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Division
                  </Badge>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="h-12 sm:h-auto px-6 sm:px-8 text-base"
                onClick={handleStartSession}
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-auto px-6 sm:px-8 text-base"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                Smart Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get personalized feedback and learn mental calculation
                strategies when you make mistakes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor your improvement over time with detailed analytics and
                performance insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Dialog */}
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </div>
    </MainLayout>
  );
}
