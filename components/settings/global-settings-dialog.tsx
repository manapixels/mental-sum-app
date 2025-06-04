"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/lib/contexts/user-context";
import { UserPreferences } from "@/lib/types";
import { Plus, Minus, Clock, Settings } from "lucide-react";
import { useSoundEffects } from "@/lib/hooks/use-audio";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { toast } from "sonner";

interface GlobalSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSettingsDialog({
  open,
  onOpenChange,
}: GlobalSettingsDialogProps) {
  const { currentUser, updateUser } = useUser();
  const { playSettingsToggle } = useSoundEffects();
  const { vibrateSettingsToggle } = useHaptic();
  const [preferences, setPreferences] = useState<UserPreferences>(
    currentUser?.preferences
      ? {
          ...currentUser.preferences,
          // Ensure numeric values are properly converted
          timeLimit: Number(currentUser.preferences.timeLimit) || 30,
          sessionLength: Number(currentUser.preferences.sessionLength) || 10,
        }
      : {
          difficultyLevel: "beginner",
          enabledOperations: {
            addition: true,
            subtraction: true,
            multiplication: true,
            division: true,
          },
          sessionLength: 10,
          timeLimit: 30,
          showStrategies: true,
          enableSound: true,
          numberRanges: {
            addition: { min: 1, max: 99 },
            subtraction: { min: 1, max: 99 },
            multiplication: { min: 1, max: 12 },
            division: { min: 1, max: 144 },
          },
        },
  );

  // Sync preferences with current user when dialog opens or user changes
  useEffect(() => {
    if (currentUser?.preferences) {
      setPreferences({
        ...currentUser.preferences,
        timeLimit: Number(currentUser.preferences.timeLimit) || 30,
        sessionLength: Number(currentUser.preferences.sessionLength) || 10,
      });
    }
  }, [currentUser?.preferences, open]); // Re-sync when dialog opens or user preferences change

  const handleSave = useCallback(() => {
    if (!currentUser || !preferences) return;

    updateUser(currentUser.id, { preferences });
    toast.success("Global settings saved successfully!");
  }, [currentUser, preferences, updateUser]);

  const handleDialogOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && currentUser) {
        // Save when closing
        handleSave();
      }
      onOpenChange(newOpen);
    },
    [handleSave, onOpenChange, currentUser],
  );

  const adjustSessionLength = (direction: "up" | "down") => {
    // Play toggle sound and haptic
    playSettingsToggle();
    vibrateSettingsToggle();

    setPreferences((prev) => {
      const currentSessionLength = Number(prev.sessionLength) || 10;
      return {
        ...prev,
        sessionLength:
          direction === "up"
            ? Math.min(currentSessionLength + 5, 50)
            : Math.max(currentSessionLength - 5, 5),
      };
    });
  };

  const adjustTimeLimit = (direction: "up" | "down") => {
    // Play toggle sound and haptic
    playSettingsToggle();
    vibrateSettingsToggle();

    setPreferences((prev) => {
      const currentTimeLimit = Number(prev.timeLimit) || 30;
      return {
        ...prev,
        timeLimit:
          direction === "up"
            ? Math.min(currentTimeLimit + 5, 120)
            : Math.max(currentTimeLimit - 5, 10),
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Settings
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Session Length */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Configuration
            </Label>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Problems per session
                </span>
                <span className="text-xs text-muted-foreground">
                  Recommended: 10-20 problems
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustSessionLength("down")}
                  disabled={preferences.sessionLength <= 5}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {preferences.sessionLength}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustSessionLength("up")}
                  disabled={preferences.sessionLength >= 50}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Time Limit */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Time per problem</span>
                <span className="text-xs text-muted-foreground">
                  Seconds to solve each problem
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustTimeLimit("down")}
                  disabled={preferences.timeLimit <= 10}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {preferences.timeLimit}s
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustTimeLimit("up")}
                  disabled={preferences.timeLimit >= 120}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Training Features */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Training Features</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    Show Strategy Hints
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Learn mental calculation strategies
                  </span>
                </div>
                <Switch
                  checked={preferences.showStrategies}
                  onCheckedChange={(checked) => {
                    // Play toggle sound and haptic
                    playSettingsToggle();
                    vibrateSettingsToggle();
                    setPreferences((prev) => ({
                      ...prev,
                      showStrategies: checked,
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
