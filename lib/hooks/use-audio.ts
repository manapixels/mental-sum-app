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

// Global initialization state to share across all hook instances
let globalAudioInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Global audio initialization function
const initializeGlobalAudio = async (): Promise<void> => {
  if (globalAudioInitialized) return;

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = (async () => {
    try {
      await initializeAudio();
      globalAudioInitialized = true;
      console.log("Audio globally initialized");
    } catch (error) {
      console.warn("Failed to globally initialize audio:", error);
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  await initializationPromise;
};

// Auto-initialize on first interaction at app level
if (typeof window !== "undefined") {
  const handleFirstInteraction = async () => {
    await initializeGlobalAudio();
    // Remove listeners after initialization
    document.removeEventListener("click", handleFirstInteraction);
    document.removeEventListener("touchstart", handleFirstInteraction);
    document.removeEventListener("keydown", handleFirstInteraction);
  };

  document.addEventListener("click", handleFirstInteraction, { passive: true });
  document.addEventListener("touchstart", handleFirstInteraction, {
    passive: true,
  });
  document.addEventListener("keydown", handleFirstInteraction, {
    passive: true,
  });
}

export function useAudio(): UseAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>(getAudioSettings());
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(
    () => globalAudioInitialized,
  );

  // Use global initialization only
  const initialize = useCallback(async () => {
    await initializeGlobalAudio();
    setIsInitialized(true);
  }, []);

  // Play sound with fallback to generated audio
  const handlePlaySound = useCallback(
    async (soundId: SoundId) => {
      if (!settings.soundEnabled) return;

      // Ensure audio is initialized (use global initialization only)
      if (!globalAudioInitialized) {
        await initializeGlobalAudio();
        setIsInitialized(true);
      }

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
          "button-click": "click",
          "keypad-tap": "click",
          "session-start": "notification",
          "timer-warning": "warning",
          "timer-critical": "warning",
          "achievement-unlock": "success",
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

      // Ensure audio is initialized (use global initialization only)
      if (!globalAudioInitialized) {
        await initializeGlobalAudio();
        setIsInitialized(true);
      }

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

  // Update ready state when audio system changes
  useEffect(() => {
    const checkReady = () => {
      setIsReady(isAudioReady());
      // Sync with global state
      if (globalAudioInitialized && !isInitialized) {
        setIsInitialized(true);
      }
    };

    // Check periodically (audio context might change state)
    const interval = setInterval(checkReady, 1000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    playSound: handlePlaySound,
    playFallbackEffect,
    settings,
    updateSettings: handleUpdateSettings,
    isReady,
    isSupported: isAudioSupported(),
    isInitialized: globalAudioInitialized,
    initialize,
  };
}

// Convenience hook for specific sound effects
export function useSoundEffects() {
  const { playSound, playFallbackEffect, isReady } = useAudio();

  return {
    playCorrect: () => playSound("correct-answer"),
    playIncorrect: () => playSound("incorrect-answer"),
    playClick: () => playSound("button-click"),
    playKeypadTap: () => playSound("keypad-tap"),
    playSessionStart: () => playSound("session-start"),
    playTimerWarning: () => playSound("timer-warning"),
    playTimerCritical: () => playSound("timer-critical"),
    playAchievement: () => playSound("achievement-unlock"),

    // Fallback effects for missing sounds
    playTimeout: () => playFallbackEffect("warning"),
    playPerfect: () => playFallbackEffect("success"),
    playTransition: () => playFallbackEffect("notification"),

    // Direct fallback effects
    playSuccess: () => playFallbackEffect("success"),
    playError: () => playFallbackEffect("error"),
    playWarning: () => playFallbackEffect("warning"),
    playNotification: () => playFallbackEffect("notification"),

    isReady,
  };
}
