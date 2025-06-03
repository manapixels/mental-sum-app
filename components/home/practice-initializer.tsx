"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Settings } from "lucide-react";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useUser } from "@/lib/contexts/user-context";
import { useRouter } from "next/navigation";

export function PracticeInitializer() {
  const { currentUser, isLoading } = useUser();
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

  // Get enabled operations for display
  const enabledOps = currentUser?.preferences?.enabledOperations;
  const enabledOperationsList = enabledOps
    ? Object.entries(enabledOps)
        .filter(([, enabled]) => enabled)
        .map(([op]) => op.charAt(0).toUpperCase() + op.slice(1))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Main Action */}
      <Card className="p-4 sm:p-8 gap-0 bg-gray-100 border-gray-300">
        <CardHeader className="pb-4 sm:pb-6 px-0">
          <CardTitle className="text-xl sm:text-2xl">
            Ready to Practice?
          </CardTitle>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              className="h-8 sm:h-auto px-6 sm:px-8 text-base"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="text-center space-y-4 px-0 flex flex-row justify-between gap-2">
          <div className="flex flex-wrap gap-2 mb-0">
            {enabledOperationsList.length > 0 ? (
              enabledOperationsList.map((op) => (
                <Badge
                  key={op}
                  variant="outline"
                  className="text-xs sm:text-sm border-gray-400 text-gray-800"
                >
                  {op}
                </Badge>
              ))
            ) : (
              <>
                <Badge className="text-xs sm:text-sm">Addition</Badge>
                <Badge className="text-xs sm:text-sm">Subtraction</Badge>
                <Badge className="text-xs sm:text-sm">Multiplication</Badge>
                <Badge className="text-xs sm:text-sm">Division</Badge>
              </>
            )}
          </div>

          <Button
            size="lg"
            className="h-12 sm:h-auto px-6 sm:px-8 text-base"
            onClick={handleStartSession}
          >
            <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Start
          </Button>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
