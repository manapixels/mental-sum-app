/**
 * React hook for haptic feedback integration in Mental Sum App
 */

import { useCallback, useState, useEffect } from "react";
import {
  triggerHaptic,
  setHapticEnabled,
  isHapticEnabled,
  isHapticSupported,
  type HapticType,
} from "@/lib/haptic";

export interface UseHapticReturn {
  // Haptic triggers
  vibrate: (type: HapticType) => void;

  // Settings
  isEnabled: boolean;
  isSupported: boolean;
  setEnabled: (enabled: boolean) => void;

  // Convenience functions for common haptic feedback
  vibrateKeypadTap: () => void;
  vibrateCorrect: () => void;
  vibrateIncorrect: () => void;
  vibrateSessionComplete: () => void;
  vibrateAchievement: () => void;
  vibrateSettingsToggle: () => void;
  vibrateButtonClick: () => void;
  vibrateTimerWarning: () => void;
  vibrateTimerCritical: () => void;
}

export function useHaptic(): UseHapticReturn {
  const [isEnabled, setIsEnabledState] = useState(isHapticEnabled());
  const [isSupported] = useState(isHapticSupported());

  // Update state when haptic settings change
  useEffect(() => {
    const checkEnabled = () => {
      setIsEnabledState(isHapticEnabled());
    };

    // Check periodically for settings changes
    const interval = setInterval(checkEnabled, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger haptic feedback
  const vibrate = useCallback(
    (type: HapticType) => {
      if (!isEnabled || !isSupported) return;
      triggerHaptic(type);
    },
    [isEnabled, isSupported],
  );

  // Update haptic enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    setHapticEnabled(enabled);
    setIsEnabledState(enabled);
  }, []);

  // Convenience functions
  const vibrateKeypadTap = useCallback(() => vibrate("keypadTap"), [vibrate]);
  const vibrateCorrect = useCallback(() => vibrate("correctAnswer"), [vibrate]);
  const vibrateIncorrect = useCallback(
    () => vibrate("incorrectAnswer"),
    [vibrate],
  );
  const vibrateSessionComplete = useCallback(
    () => vibrate("sessionComplete"),
    [vibrate],
  );
  const vibrateAchievement = useCallback(
    () => vibrate("achievementUnlock"),
    [vibrate],
  );
  const vibrateSettingsToggle = useCallback(
    () => vibrate("settingsToggle"),
    [vibrate],
  );
  const vibrateButtonClick = useCallback(
    () => vibrate("buttonClick"),
    [vibrate],
  );
  const vibrateTimerWarning = useCallback(
    () => vibrate("timerWarning"),
    [vibrate],
  );
  const vibrateTimerCritical = useCallback(
    () => vibrate("timerCritical"),
    [vibrate],
  );

  return {
    vibrate,
    isEnabled,
    isSupported,
    setEnabled,
    vibrateKeypadTap,
    vibrateCorrect,
    vibrateIncorrect,
    vibrateSessionComplete,
    vibrateAchievement,
    vibrateSettingsToggle,
    vibrateButtonClick,
    vibrateTimerWarning,
    vibrateTimerCritical,
  };
}
