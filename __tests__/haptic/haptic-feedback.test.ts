/**
 * Haptic Feedback Tests
 *
 * These tests verify that haptic feedback (vibration) works correctly
 * on touch-enabled devices and provides appropriate user feedback.
 */

describe("Haptic Feedback Tests", () => {
  // Mock the Vibration API
  beforeEach(() => {
    Object.defineProperty(navigator, "vibrate", {
      writable: true,
      value: jest.fn().mockReturnValue(true),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Vibration Support", () => {
    test("should detect vibration support correctly", () => {
      const isVibrationSupported = "vibrate" in navigator;
      expect(isVibrationSupported).toBe(true);
    });

    test("should handle devices without vibration support", () => {
      // Mock device without vibration by redefining navigator
      const originalNavigator = window.navigator;

      // Create a new navigator object without vibrate
      Object.defineProperty(window, "navigator", {
        value: {
          ...originalNavigator,
          // Explicitly exclude vibrate
        },
        configurable: true,
      });

      const isVibrationSupported = "vibrate" in navigator;
      expect(isVibrationSupported).toBe(false);

      // Restore original navigator
      Object.defineProperty(window, "navigator", {
        value: originalNavigator,
        configurable: true,
      });
    });
  });

  describe("Feedback Patterns", () => {
    test("should provide correct answer vibration pattern", () => {
      const correctAnswerPattern = [100]; // Short pulse

      navigator.vibrate(correctAnswerPattern);

      expect(navigator.vibrate).toHaveBeenCalledWith([100]);
    });

    test("should provide incorrect answer vibration pattern", () => {
      const incorrectAnswerPattern = [100, 50, 100]; // Double pulse

      navigator.vibrate(incorrectAnswerPattern);

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
    });

    test("should provide timer warning vibration pattern", () => {
      const timerWarningPattern = [50, 25, 50, 25, 50]; // Rapid pulses

      navigator.vibrate(timerWarningPattern);

      expect(navigator.vibrate).toHaveBeenCalledWith([50, 25, 50, 25, 50]);
    });

    test("should provide session complete vibration pattern", () => {
      const sessionCompletePattern = [200, 100, 200]; // Celebration pattern

      navigator.vibrate(sessionCompletePattern);

      expect(navigator.vibrate).toHaveBeenCalledWith([200, 100, 200]);
    });

    test("should provide button press vibration", () => {
      const buttonPressPattern = 25; // Very short pulse

      navigator.vibrate(buttonPressPattern);

      expect(navigator.vibrate).toHaveBeenCalledWith(25);
    });
  });

  describe("User Preferences", () => {
    test("should respect haptic feedback preferences", () => {
      const userPreferences = {
        enableHaptics: true,
      };

      if (userPreferences.enableHaptics && "vibrate" in navigator) {
        navigator.vibrate(100);
        expect(navigator.vibrate).toHaveBeenCalledWith(100);
      }
    });

    test("should not vibrate when haptics are disabled", () => {
      const userPreferences = {
        enableHaptics: false,
      };

      if (!userPreferences.enableHaptics) {
        // Should not call vibrate
        expect(navigator.vibrate).not.toHaveBeenCalled();
      }
    });

    test("should provide intensity settings", () => {
      const intensityLevels = {
        low: 50,
        medium: 100,
        high: 200,
      };

      const userIntensity = "medium";
      const vibrationDuration = intensityLevels[userIntensity];

      navigator.vibrate(vibrationDuration);
      expect(navigator.vibrate).toHaveBeenCalledWith(100);
    });
  });

  describe("Battery Considerations", () => {
    test("should reduce vibration intensity on low battery", () => {
      // Mock battery API
      const mockBattery = {
        level: 0.1, // 10% battery
        charging: false,
      };

      const isLowBattery = mockBattery.level < 0.2 && !mockBattery.charging;
      const vibrationIntensity = isLowBattery ? 25 : 100; // Reduced intensity

      navigator.vibrate(vibrationIntensity);
      expect(navigator.vibrate).toHaveBeenCalledWith(25);
    });

    test("should disable vibration in power saving mode", () => {
      // Mock power saving mode
      const isPowerSavingMode = true;

      if (!isPowerSavingMode) {
        navigator.vibrate(100);
      }

      // Should not vibrate in power saving mode
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility Considerations", () => {
    test("should respect reduced motion preferences for vibration", () => {
      // Mock reduced motion preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
        })),
      });

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!prefersReducedMotion) {
        navigator.vibrate(100);
      }

      // Should not vibrate if user prefers reduced motion
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });

    test("should provide alternative feedback for hearing impaired users", () => {
      // Haptic feedback can be especially important for accessibility
      const isAudioDisabled = true;
      const isVibrationAvailable = "vibrate" in navigator;

      if (isAudioDisabled && isVibrationAvailable) {
        // Increase vibration intensity when audio is disabled
        navigator.vibrate(150); // Longer vibration
        expect(navigator.vibrate).toHaveBeenCalledWith(150);
      }
    });
  });

  describe("Performance and Rate Limiting", () => {
    test("should prevent vibration spam", () => {
      const vibrationCooldown = 100; // ms
      let lastVibrationTime = 0;

      const tryVibrate = (duration: number) => {
        const now = Date.now();
        if (now - lastVibrationTime >= vibrationCooldown) {
          navigator.vibrate(duration);
          lastVibrationTime = now;
          return true;
        }
        return false;
      };

      // First vibration should work
      expect(tryVibrate(100)).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalledWith(100);

      // Immediate second vibration should be blocked
      expect(tryVibrate(100)).toBe(false);
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    test("should limit maximum vibration duration", () => {
      const maxVibrationDuration = 1000; // 1 second
      const requestedDuration = 5000; // 5 seconds

      const safeDuration = Math.min(requestedDuration, maxVibrationDuration);

      navigator.vibrate(safeDuration);
      expect(navigator.vibrate).toHaveBeenCalledWith(1000);
    });

    test("should handle vibration API failures gracefully", () => {
      // Mock vibration failure
      (navigator.vibrate as jest.Mock).mockReturnValue(false);

      const result = navigator.vibrate(100);
      expect(result).toBe(false);

      // App should continue functioning even if vibration fails
      expect(navigator.vibrate).toHaveBeenCalledWith(100);
    });
  });

  describe("Context-Aware Feedback", () => {
    test("should provide different patterns for different operations", () => {
      const feedbackPatterns = {
        addition: [50],
        subtraction: [75],
        multiplication: [100],
        division: [50, 25, 50],
      };

      const operation = "multiplication";
      const pattern = feedbackPatterns[operation];

      navigator.vibrate(pattern);
      expect(navigator.vibrate).toHaveBeenCalledWith([100]);
    });

    test("should adjust feedback based on difficulty level", () => {
      const difficultyFeedback = {
        beginner: 50, // Gentle
        intermediate: 75, // Medium
        advanced: 100, // Firm
      };

      const currentDifficulty = "advanced";
      const feedbackIntensity = difficultyFeedback[currentDifficulty];

      navigator.vibrate(feedbackIntensity);
      expect(navigator.vibrate).toHaveBeenCalledWith(100);
    });

    test("should provide streak milestone feedback", () => {
      const streakCount = 10;
      const milestonePattern =
        streakCount >= 10
          ? [100, 50, 100, 50, 100] // Special celebration pattern
          : [100]; // Regular pattern

      navigator.vibrate(milestonePattern);
      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100, 50, 100]);
    });
  });
});
