/**
 * React hook for audio integration in Mental Sum App
 */

import { useEffect, useCallback, useState } from "react";
import {
  initializeAudio,
  playSound,
  getAudioSettings,
  updateAudioSettings,
  isAudioReady,
  isAudioSupported,
  type SoundId,
  type AudioSettings,
} from "@/lib/audio";
import { playEffect } from "@/lib/audio-generator";

export interface UseAudioReturn {
  // Sound playback
  playSound: (soundId: SoundId) => Promise<void>;
  playFallbackEffect: (
    effect: "success" | "error" | "warning" | "click" | "notification",
  ) => Promise<void>;

  // Settings
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;

  // Status
  isReady: boolean;
  isSupported: boolean;
  isInitialized: boolean;

  // Initialization
  initialize: () => Promise<void>;
}

export function useAudio(): UseAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>(getAudioSettings());
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio system on first user interaction
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      await initializeAudio();
      setIsReady(isAudioReady());
      setIsInitialized(true);
    } catch (error) {
      console.warn("Failed to initialize audio:", error);
    }
  }, [isInitialized]);

  // Play sound with fallback to generated audio
  const handlePlaySound = useCallback(
    async (soundId: SoundId) => {
      if (!settings.soundEnabled) return;

      try {
        // Try to play the actual sound file
        await playSound(soundId);
      } catch (error) {
        // Fallback to generated audio
        console.debug(`Falling back to generated audio for ${soundId}:`, error);

        // Map sound IDs to fallback effects
        const fallbackMap: Record<SoundId, Parameters<typeof playEffect>[0]> = {
          "correct-answer": "success",
          "incorrect-answer": "error",
          "perfect-session": "success",
          timeout: "warning",
          "button-click": "click",
          "keypad-tap": "click",
          "session-start": "notification",
          "timer-warning": "warning",
          "timer-critical": "warning",
          "achievement-unlock": "success",
          "page-transition": "notification",
        };

        const fallbackEffect = fallbackMap[soundId];
        if (fallbackEffect) {
          await playEffect(fallbackEffect);
        }
      }
    },
    [settings.soundEnabled],
  );

  // Play fallback effect directly
  const playFallbackEffect = useCallback(
    async (effect: Parameters<typeof playEffect>[0]) => {
      if (!settings.soundEnabled) return;
      await playEffect(effect);
    },
    [settings.soundEnabled],
  );

  // Update settings and sync state
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<AudioSettings>) => {
      updateAudioSettings(newSettings);
      setSettings(getAudioSettings());
    },
    [],
  );

  // Auto-initialize on first interaction (when component mounts)
  useEffect(() => {
    // Set up one-time initialization listener
    const handleFirstInteraction = () => {
      initialize();
      // Remove listeners after first initialization
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    // Only add listeners if not already initialized
    if (!isInitialized) {
      document.addEventListener("click", handleFirstInteraction, {
        passive: true,
      });
      document.addEventListener("touchstart", handleFirstInteraction, {
        passive: true,
      });
      document.addEventListener("keydown", handleFirstInteraction, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [initialize, isInitialized]);

  // Update ready state when audio system changes
  useEffect(() => {
    const checkReady = () => {
      setIsReady(isAudioReady());
    };

    // Check periodically (audio context might change state)
    const interval = setInterval(checkReady, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    playSound: handlePlaySound,
    playFallbackEffect,
    settings,
    updateSettings: handleUpdateSettings,
    isReady,
    isSupported: isAudioSupported(),
    isInitialized,
    initialize,
  };
}

// Convenience hook for specific sound effects
export function useSoundEffects() {
  const { playSound, playFallbackEffect, isReady } = useAudio();

  return {
    playCorrect: () => playSound("correct-answer"),
    playIncorrect: () => playSound("incorrect-answer"),
    playPerfect: () => playSound("perfect-session"),
    playTimeout: () => playSound("timeout"),
    playClick: () => playSound("button-click"),
    playKeypadTap: () => playSound("keypad-tap"),
    playSessionStart: () => playSound("session-start"),
    playTimerWarning: () => playSound("timer-warning"),
    playTimerCritical: () => playSound("timer-critical"),
    playAchievement: () => playSound("achievement-unlock"),
    playTransition: () => playSound("page-transition"),

    // Fallback effects
    playSuccess: () => playFallbackEffect("success"),
    playError: () => playFallbackEffect("error"),
    playWarning: () => playFallbackEffect("warning"),
    playNotification: () => playFallbackEffect("notification"),

    isReady,
  };
}
