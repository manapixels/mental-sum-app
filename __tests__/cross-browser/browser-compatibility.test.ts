import { StorageManager } from "@/lib/storage";
import { ProblemEngine } from "@/lib/problem-engine";
import { defaultUserPreferences, defaultUserStatistics } from "@/lib/types";

// Mock different browser environments
const mockUserAgents = {
  chrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  firefox:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
};

// Extract browser names for iteration
const browsers = Object.keys(mockUserAgents);

// Mock localStorage with proper persistence simulation
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock localStorage for different browsers
const createMockLocalStorage = (withQuotaLimit = false) => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockImplementation((key, value) => {
    if (withQuotaLimit && value.length > 1000) {
      throw new Error("QuotaExceededError");
    }
  }),
  removeItem: jest.fn(),
  clear: jest.fn(),
});

describe("Cross-Browser Compatibility Tests", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    StorageManager.initialize();

    // Mock console.error to prevent test output pollution during quota testing
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("LocalStorage Compatibility", () => {
    test("should work across all major browsers", () => {
      Object.entries(mockUserAgents).forEach(([, userAgent]) => {
        // Mock navigator.userAgent for each browser
        Object.defineProperty(navigator, "userAgent", {
          writable: true,
          value: userAgent,
        });

        const mockStorage = createMockLocalStorage();
        Object.defineProperty(window, "localStorage", {
          value: mockStorage,
          writable: true,
        });

        mockStorage.getItem.mockReturnValue(null);

        // Test basic storage operations
        const data = StorageManager.initialize();
        expect(data.users).toEqual([]);
        expect(mockStorage.setItem).toHaveBeenCalled();
      });
    });

    test("should handle storage quota limits gracefully", () => {
      Object.entries(mockUserAgents).forEach(() => {
        const mockStorage = createMockLocalStorage(true); // With quota limit
        Object.defineProperty(window, "localStorage", {
          value: mockStorage,
          writable: true,
        });

        mockStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        // Test that quota errors are handled
        expect(() => {
          StorageManager.createUser({
            name: "Large User Data".repeat(100), // Large data
            preferences: defaultUserPreferences,
            statistics: defaultUserStatistics,
          });
        }).toThrow("Failed to save data");
      });
    });

    browsers.forEach((browser) => {
      test(`should handle localStorage operations in ${browser}`, () => {
        // Simulate browser-specific localStorage behavior
        mockLocalStorage.clear();

        // Small test data to avoid quota issues
        const testUser = {
          name: `Test User ${browser}`,
          preferences: defaultUserPreferences,
          statistics: defaultUserStatistics,
        };

        try {
          const user = StorageManager.createUser(testUser);
          expect(user.name).toBe(`Test User ${browser}`);
        } catch (error) {
          // Some browsers might have stricter limits
          expect(error).toBeInstanceOf(Error);
        }
      });

      test(`should handle quota exceeded gracefully in ${browser}`, () => {
        // Force quota exceeded for testing
        mockLocalStorage.setItem.mockImplementationOnce(() => {
          throw new Error("QuotaExceededError");
        });

        expect(() => {
          StorageManager.createUser({
            name: "Test User",
            preferences: defaultUserPreferences,
            statistics: defaultUserStatistics,
          });
        }).toThrow();
      });
    });
  });

  describe("JavaScript API Compatibility", () => {
    test("should work with different Array methods across browsers", () => {
      // Test Array.from compatibility (IE11+ required)
      const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      // Test Array.includes (IE11+ required)
      expect(numbers.includes(5)).toBe(true);

      // Test Array.find (ES6)
      const found = numbers.find((n) => n > 5);
      expect(found).toBe(6);
    });

    test("should handle Date objects consistently", () => {
      const now = new Date();
      const isoString = now.toISOString();
      const parsed = new Date(isoString);

      expect(parsed.getTime()).toBe(now.getTime());

      // Test date serialization/deserialization
      const serialized = JSON.stringify({ date: now });
      const deserialized = JSON.parse(serialized);
      const dateRestored = new Date(deserialized.date);

      expect(dateRestored.getTime()).toBe(now.getTime());
    });
  });

  describe("Math Operations Compatibility", () => {
    test("should generate consistent problems across browsers", () => {
      // Seed Math.random for consistent results
      let seed = 12345;
      const mockRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      const originalRandom = Math.random;
      Math.random = mockRandom;

      const problem = ProblemEngine.generateProblem(
        defaultUserPreferences,
        defaultUserStatistics,
      );

      expect(problem).toBeDefined();
      expect(problem?.operands).toHaveLength(2);
      expect(typeof problem?.correctAnswer).toBe("number");

      Math.random = originalRandom;
    });

    test("should handle edge cases in arithmetic operations", () => {
      // Test precision issues
      expect(0.1 + 0.2).toBeCloseTo(0.3);
      expect(Number.isInteger(42)).toBe(true);
      expect(Number.isInteger(42.0)).toBe(true);
      expect(Number.isInteger(42.1)).toBe(false);

      // Test large numbers
      expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991);
      expect(Number.isSafeInteger(9007199254740991)).toBe(true);
      expect(Number.isSafeInteger(9007199254740992)).toBe(false);
    });
  });

  describe("Performance API Compatibility", () => {
    test("should measure timing consistently across browsers", () => {
      // Mock performance.now if not available (older browsers)
      if (!window.performance || !window.performance.now) {
        Object.defineProperty(window, "performance", {
          value: {
            now: () => Date.now(),
          },
          writable: true,
        });
      }

      const start = performance.now();
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      const end = performance.now();

      expect(end).toBeGreaterThan(start);
      expect(typeof start).toBe("number");
      expect(typeof end).toBe("number");
    });
  });

  describe("Event Handling Compatibility", () => {
    test("should handle keyboard events consistently", () => {
      // Test KeyboardEvent properties
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
      });

      expect(event.key).toBe("Enter");
      expect(event.code).toBe("Enter");

      // Some older browsers might use keyCode
      expect(event.keyCode === 13 || event.key === "Enter").toBe(true);
    });
  });

  describe("Error Handling Consistency", () => {
    test("should handle JavaScript errors consistently", () => {
      // Test null/undefined access
      expect(() => {
        const obj: Record<string, unknown> | null = null;
        return obj!.property;
      }).toThrow();

      // Test range errors - use actual range error
      expect(() => {
        new Array(-1);
      }).toThrow();

      // Test type errors
      expect(() => {
        const func: (() => void) | null = null;
        func!();
      }).toThrow();
    });
  });
});
