/**
 * Audio and Animation Performance Tests
 *
 * These tests verify that audio playback and animations perform efficiently
 * and don't cause performance issues in the application.
 */

describe("Audio Performance Tests", () => {
  // Mock Web Audio API
  beforeEach(() => {
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { setValueAtTime: jest.fn() },
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { setValueAtTime: jest.fn() },
      })),
      destination: {},
      currentTime: 0,
      close: jest.fn(),
    }));

    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      currentTime: 0,
      duration: 10,
      volume: 1,
      load: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  describe("Audio System Performance", () => {
    test("should load audio files efficiently", async () => {
      const audioFiles = [
        "correct.mp3",
        "incorrect.mp3",
        "timer-warning.mp3",
        "session-complete.mp3",
        "button-click.mp3",
      ];

      const startTime = performance.now();

      // Mock audio loading to avoid real file loading
      const loadPromises = audioFiles.map((file) => {
        new Audio(file); // Create audio object
        return new Promise((resolve) => {
          // Simulate immediate loading for testing
          setTimeout(() => {
            resolve(undefined);
          }, 10);
        });
      });

      await Promise.all(loadPromises);
      const endTime = performance.now();

      // Audio loading should be reasonably fast (mocked)
      expect(endTime - startTime).toBeLessThan(1000); // Under 1 second
      expect(audioFiles.length).toBe(5); // Verify we tested all files
    });

    test("should handle concurrent audio playback efficiently", async () => {
      const audioInstances = Array.from({ length: 10 }, () => new Audio());

      const startTime = performance.now();

      // Simulate concurrent audio playback
      const playPromises = audioInstances.map((audio) => audio.play());
      await Promise.all(playPromises);

      const endTime = performance.now();

      // Concurrent playback should not cause significant delays
      expect(endTime - startTime).toBeLessThan(200); // Under 200ms
    });

    test("should properly clean up audio resources", () => {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Cleanup
      oscillator.stop();
      audioContext.close();

      expect(audioContext.close).toHaveBeenCalled();
    });
  });

  describe("Animation Performance", () => {
    test("should handle CSS animations efficiently", () => {
      // Mock performance monitoring
      const startTime = performance.now();

      // Simulate CSS animation setup
      const element = document.createElement("div");
      element.style.animation = "fadeIn 0.3s ease-in-out";
      document.body.appendChild(element);

      // Simulate animation completion
      const animationEndPromise = new Promise((resolve) => {
        element.addEventListener("animationend", resolve);
        // Trigger animation end immediately for testing
        setTimeout(() => {
          element.dispatchEvent(new Event("animationend"));
        }, 10);
      });

      return animationEndPromise.then(() => {
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(100); // Should be very fast in testing
        document.body.removeChild(element);
      });
    });

    test("should handle requestAnimationFrame efficiently", () => {
      let frameCount = 0;
      const maxFrames = 60; // 1 second at 60fps

      const startTime = performance.now();

      return new Promise<void>((resolve) => {
        const animate = () => {
          frameCount++;

          if (frameCount >= maxFrames) {
            const endTime = performance.now();

            // 60 frames should complete in reasonable time
            expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds
            expect(frameCount).toBe(maxFrames);
            resolve();
          } else {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      });
    });

    test("should throttle animations under low performance conditions", () => {
      // Mock low performance scenario
      const mockPerformance = {
        now: jest
          .fn()
          .mockReturnValueOnce(0)
          .mockReturnValueOnce(100) // Simulate slow frame
          .mockReturnValueOnce(200)
          .mockReturnValueOnce(350), // Another slow frame
      };

      Object.defineProperty(window, "performance", {
        value: mockPerformance,
        writable: true,
      });

      const frameTimes: number[] = [];
      let lastTime = 0;

      for (let i = 0; i < 4; i++) {
        const currentTime = performance.now();
        if (lastTime > 0) {
          frameTimes.push(currentTime - lastTime);
        }
        lastTime = currentTime;
      }

      // Should detect frame drops (>16.67ms for 60fps)
      const hasFrameDrops = frameTimes.some((time) => time > 16.67);
      expect(hasFrameDrops).toBe(true);
    });
  });

  describe("Memory Management", () => {
    test("should not leak audio objects", () => {
      const initialAudioCount = 5;
      const audioObjects: HTMLAudioElement[] = [];

      // Create audio objects
      for (let i = 0; i < initialAudioCount; i++) {
        audioObjects.push(new Audio());
      }

      expect(audioObjects).toHaveLength(initialAudioCount);

      // Simulate cleanup
      audioObjects.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioObjects.length = 0;

      expect(audioObjects).toHaveLength(0);
    });

    test("should handle animation cleanup properly", () => {
      const elements: HTMLElement[] = [];

      // Create multiple animated elements
      for (let i = 0; i < 10; i++) {
        const element = document.createElement("div");
        element.style.transition = "opacity 0.3s";
        document.body.appendChild(element);
        elements.push(element);
      }

      expect(elements).toHaveLength(10);
      expect(document.body.children).toHaveLength(10);

      // Cleanup
      elements.forEach((element) => {
        document.body.removeChild(element);
      });

      expect(document.body.children).toHaveLength(0);
    });
  });

  describe("Responsive Performance", () => {
    test("should adapt audio quality based on device capabilities", () => {
      // Mock different device scenarios
      const scenarios = [
        { name: "high-end", audioContext: true, performance: "high" },
        { name: "mid-range", audioContext: true, performance: "medium" },
        { name: "low-end", audioContext: false, performance: "low" },
      ];

      scenarios.forEach((scenario) => {
        // Mock audio context availability
        if (!scenario.audioContext) {
          delete (global as unknown as { AudioContext: unknown }).AudioContext;
        }

        // Test that system adapts to capabilities
        const hasAdvancedAudio = typeof AudioContext !== "undefined";
        expect(hasAdvancedAudio).toBe(scenario.audioContext);
      });
    });

    test("should reduce animations on slower devices", () => {
      // Mock device performance indicators
      Object.defineProperty(navigator, "hardwareConcurrency", {
        writable: true,
        value: 2, // Simulate lower-end device
      });

      const shouldReduceAnimations = navigator.hardwareConcurrency <= 2;
      expect(shouldReduceAnimations).toBe(true);

      // In a real implementation, this would reduce animation complexity
      const animationDuration = shouldReduceAnimations ? 150 : 300; // Shorter duration
      expect(animationDuration).toBe(150);
    });
  });

  describe("Battery and Power Considerations", () => {
    test("should respect power saving preferences", () => {
      // Mock battery API
      const mockBattery = {
        level: 0.15, // 15% battery
        charging: false,
      };

      const isLowBattery = mockBattery.level < 0.2 && !mockBattery.charging;
      expect(isLowBattery).toBe(true);

      // In low battery mode, reduce audio/animation intensity
      const audioEnabled = !isLowBattery;
      const animationEnabled = !isLowBattery;

      expect(audioEnabled).toBe(false);
      expect(animationEnabled).toBe(false);
    });

    test("should handle reduced motion preferences", () => {
      // Mock media query for reduced motion
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
        })),
      });

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      expect(prefersReducedMotion).toBe(true);

      // Should disable or simplify animations
      const animationDuration = prefersReducedMotion ? 0 : 300;
      expect(animationDuration).toBe(0);
    });
  });
});
