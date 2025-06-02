"use client";

import { useAudio } from "@/lib/hooks/use-audio";
import { useSoundEffects } from "@/lib/hooks/use-audio";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Volume1, Play, Vibrate } from "lucide-react";
import { useState } from "react";

export function AudioSettings() {
  const { settings, updateSettings, isSupported, isReady, playFallbackEffect } =
    useAudio();
  const { playSettingsToggle } = useSoundEffects();
  const {
    isEnabled: hapticEnabled,
    isSupported: hapticSupported,
    setEnabled: setHapticEnabled,
    vibrateSettingsToggle,
  } = useHaptic();

  const [testingSound, setTestingSound] = useState(false);
  const [testingHaptic, setTestingHaptic] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ masterVolume: parseFloat(e.target.value) });
  };

  const handleTestSound = async () => {
    if (testingSound) return;

    setTestingSound(true);
    try {
      await playFallbackEffect("notification");
    } catch (error) {
      console.warn("Failed to test sound:", error);
    } finally {
      setTimeout(() => setTestingSound(false), 1000);
    }
  };

  const handleTestHaptic = async () => {
    if (testingHaptic || !hapticSupported) return;

    setTestingHaptic(true);
    try {
      vibrateSettingsToggle();
    } catch (error) {
      console.warn("Failed to test haptic:", error);
    } finally {
      setTimeout(() => setTestingHaptic(false), 1000);
    }
  };

  const handleToggleChange = (key: keyof typeof settings, value: boolean) => {
    // Play toggle sound if not disabling all sounds
    if (key !== "soundEnabled" || value) {
      playSettingsToggle();
    }
    // Also trigger haptic for settings toggles
    vibrateSettingsToggle();
    updateSettings({ [key]: value });
  };

  const handleHapticToggle = (enabled: boolean) => {
    // Don't play haptic when disabling haptic
    if (enabled) {
      vibrateSettingsToggle();
    }
    playSettingsToggle();
    setHapticEnabled(enabled);
  };

  const getVolumeIcon = () => {
    if (!settings.soundEnabled || settings.masterVolume === 0) {
      return <VolumeX className="h-4 w-4" />;
    } else if (settings.masterVolume < 0.5) {
      return <Volume1 className="h-4 w-4" />;
    } else {
      return <Volume2 className="h-4 w-4" />;
    }
  };

  if (!isSupported && !hapticSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5 text-muted-foreground" />
            Audio & Haptic Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            Audio and haptic feedback are not supported on this device or
            browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getVolumeIcon()}
          Audio & Haptic Settings
        </CardTitle>
        {!isReady && (
          <p className="text-sm text-muted-foreground">
            Audio will initialize after your first interaction
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Audio Settings */}
        {isSupported && (
          <>
            {/* Master Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">Enable Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all audio feedback
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  handleToggleChange("soundEnabled", checked)
                }
              />
            </div>

            {/* Master Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Master Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                {getVolumeIcon()}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.masterVolume}
                  onChange={handleVolumeChange}
                  disabled={!settings.soundEnabled}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${settings.masterVolume * 100}%, #e5e7eb ${settings.masterVolume * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Test Sound Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSound}
                disabled={!settings.soundEnabled || testingSound}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {testingSound ? "Playing..." : "Test Sound"}
              </Button>
            </div>

            {/* Sound Categories */}
            {settings.soundEnabled && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Sound Categories</h4>

                <div className="space-y-3">
                  {/* Feedback Sounds */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="feedback-sounds">Answer Feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Correct/incorrect answer sounds
                      </p>
                    </div>
                    <Switch
                      id="feedback-sounds"
                      checked={settings.feedbackSoundsEnabled}
                      onCheckedChange={(checked) =>
                        handleToggleChange("feedbackSoundsEnabled", checked)
                      }
                    />
                  </div>

                  {/* Interface Sounds */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="interface-sounds">Interface Sounds</Label>
                      <p className="text-sm text-muted-foreground">
                        Button clicks and navigation
                      </p>
                    </div>
                    <Switch
                      id="interface-sounds"
                      checked={settings.interfaceSoundsEnabled}
                      onCheckedChange={(checked) =>
                        handleToggleChange("interfaceSoundsEnabled", checked)
                      }
                    />
                  </div>

                  {/* Timer Sounds */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="timer-sounds">Timer Warnings</Label>
                      <p className="text-sm text-muted-foreground">
                        Low time and timeout alerts
                      </p>
                    </div>
                    <Switch
                      id="timer-sounds"
                      checked={settings.timerSoundsEnabled}
                      onCheckedChange={(checked) =>
                        handleToggleChange("timerSoundsEnabled", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Haptic Feedback Settings */}
        {hapticSupported && (
          <>
            {isSupported && <div className="border-t" />}

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                Haptic Feedback
              </h4>

              {/* Master Haptic Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="haptic-enabled">Enable Vibration</Label>
                  <p className="text-sm text-muted-foreground">
                    Physical vibration feedback on mobile devices
                  </p>
                </div>
                <Switch
                  id="haptic-enabled"
                  checked={hapticEnabled}
                  onCheckedChange={handleHapticToggle}
                />
              </div>

              {/* Test Haptic Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestHaptic}
                  disabled={!hapticEnabled || testingHaptic}
                  className="flex items-center gap-2"
                >
                  <Vibrate className="h-4 w-4" />
                  {testingHaptic ? "Testing..." : "Test Vibration"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Status */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {isSupported && hapticSupported && (
            <>
              Audio: {isReady ? "Ready" : "Initializing..."} • Haptic:{" "}
              {hapticEnabled ? "Enabled" : "Disabled"}
            </>
          )}
          {isSupported && !hapticSupported && (
            <>
              Audio: {isReady ? "Ready" : "Initializing..."} • Haptic: Not
              supported
            </>
          )}
          {!isSupported && hapticSupported && (
            <>
              Audio: Not supported • Haptic:{" "}
              {hapticEnabled ? "Enabled" : "Disabled"}
            </>
          )}
          {isSupported && isReady && (
            <> • Volume: {Math.round(settings.masterVolume * 100)}%</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
