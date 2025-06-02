/**
 * Haptic Feedback System for Mental Sum App
 * Manages device vibration patterns for enhanced mobile UX
 */

export interface HapticPattern {
  vibrate: number | number[]; // Single duration or pattern array
  description: string;
}

export type HapticType =
  | "keypadTap"
  | "correctAnswer"
  | "incorrectAnswer"
  | "timeoutWarning"
  | "sessionComplete"
  | "achievementUnlock"
  | "settingsToggle"
  | "buttonClick"
  | "timerWarning"
  | "timerCritical";

class HapticManager {
  private isSupported: boolean = false;
  private hapticEnabled: boolean = true;

  // Haptic patterns for different feedback types
  private patterns: Record<HapticType, HapticPattern> = {
    keypadTap: {
      vibrate: 10,
      description: "Light tap for number keypad presses",
    },
    correctAnswer: {
      vibrate: [50, 30, 50],
      description: "Success pulse - short vibrate, pause, short vibrate",
    },
    incorrectAnswer: {
      vibrate: [100, 50, 100],
      description: "Error pattern - double tap with stronger intensity",
    },
    timeoutWarning: {
      vibrate: [200, 100, 200],
      description: "Warning pattern for timeout",
    },
    sessionComplete: {
      vibrate: [50, 50, 50, 50, 100],
      description: "Success celebration sequence",
    },
    achievementUnlock: {
      vibrate: [30, 30, 30, 30, 30, 30, 150],
      description: "Special achievement pattern with finale",
    },
    settingsToggle: {
      vibrate: 15,
      description: "Subtle confirmation for settings changes",
    },
    buttonClick: {
      vibrate: 8,
      description: "Minimal feedback for button presses",
    },
    timerWarning: {
      vibrate: [50, 50, 50],
      description: "Timer warning gentle vibration",
    },
    timerCritical: {
      vibrate: [100, 50, 100, 50, 100],
      description: "Critical timer alert pattern",
    },
  };

  constructor() {
    this.checkHapticSupport();
    this.loadSettings();
  }

  /**
   * Check if haptic feedback is supported on this device
   */
  private checkHapticSupport(): void {
    if (typeof window === "undefined") {
      this.isSupported = false;
      return;
    }

    this.isSupported = "vibrate" in navigator;
  }

  /**
   * Load haptic settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("mental-sum-haptic-enabled");
      if (stored !== null) {
        this.hapticEnabled = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load haptic settings:", error);
    }
  }

  /**
   * Save haptic settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "mental-sum-haptic-enabled",
        JSON.stringify(this.hapticEnabled),
      );
    } catch (error) {
      console.warn("Failed to save haptic settings:", error);
    }
  }

  /**
   * Trigger haptic feedback for a specific type
   */
  vibrate(type: HapticType): void {
    if (!this.isSupported || !this.hapticEnabled) return;

    const pattern = this.patterns[type];
    if (!pattern) {
      console.warn(`Unknown haptic type: ${type}`);
      return;
    }

    try {
      navigator.vibrate(pattern.vibrate);
    } catch (error) {
      console.debug(`Failed to trigger haptic feedback:`, error);
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Check if haptic feedback is enabled
   */
  isEnabled(): boolean {
    return this.hapticEnabled;
  }

  /**
   * Check if haptic feedback is supported
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get available haptic patterns
   */
  getPatterns(): Record<HapticType, HapticPattern> {
    return { ...this.patterns };
  }
}

// Create singleton instance
export const hapticManager = new HapticManager();

// Export convenience functions
export const triggerHaptic = (type: HapticType) => hapticManager.vibrate(type);
export const setHapticEnabled = (enabled: boolean) =>
  hapticManager.setEnabled(enabled);
export const isHapticEnabled = () => hapticManager.isEnabled();
export const isHapticSupported = () => hapticManager.isHapticSupported();
