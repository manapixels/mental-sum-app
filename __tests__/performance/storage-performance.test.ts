import { StorageManager } from "@/lib/storage";
import {
  defaultUserPreferences,
  defaultUserStatistics,
  initializeStrategyPerformance,
} from "@/lib/types";

// Mock localStorage with limited capacity simulation
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  let quotaExceeded = false;

  return {
    getItem: jest.fn((key: string) => {
      if (key === "corrupted-data") {
        return "invalid json{{{";
      }
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      // Simulate quota exceeded for very large data
      if (quotaExceeded || value.length > 100000) {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      }
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    setQuotaExceeded: (value: boolean) => {
      quotaExceeded = value;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Storage Performance Tests", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setQuotaExceeded(false);

    // Mock console.error to prevent test output pollution
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock the storage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    // Initialize with minimal valid data
    StorageManager.initialize();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Large Dataset Performance", () => {
    test("should handle large user datasets efficiently", () => {
      const startTime = performance.now();

      // Create users with reasonable data size
      const users = [];
      for (let i = 0; i < 100; i++) {
        try {
          const user = StorageManager.createUser({
            name: `User ${i}`,
            preferences: {
              ...defaultUserPreferences,
              enabledOperations: {
                addition: true,
                subtraction: true,
                multiplication: true,
                division: true,
              },
              sessionLength: 10,
              enableSound: true,
              enableHaptics: false,
            },
            statistics: {
              ...defaultUserStatistics,
              strategyPerformance: initializeStrategyPerformance(),
            },
          });
          users.push(user);
        } catch {
          // If we hit quota limits, that's expected behavior
          break;
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(users.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test("should perform bulk operations efficiently", () => {
      const user = StorageManager.createUser({
        name: "Test User",
        preferences: {
          ...defaultUserPreferences,
          enabledOperations: {
            addition: true,
            subtraction: false,
            multiplication: false,
            division: false,
          },
          sessionLength: 5,
          enableSound: false,
          enableHaptics: false,
        },
        statistics: {
          ...defaultUserStatistics,
          strategyPerformance: initializeStrategyPerformance(),
        },
      });

      const startTime = performance.now();

      // Create multiple sessions
      for (let i = 0; i < 50; i++) {
        try {
          StorageManager.createSession({
            userId: user.id,
            startTime: new Date(),
            problems: [],
            completed: false,
            totalCorrect: 0,
            totalWrong: 0,
            averageTime: 0,
            sessionLength: 5,
          });
        } catch {
          // Expected if we hit storage limits
          break;
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe("Error Handling Performance", () => {
    test("should handle storage quota exceeded gracefully", () => {
      // Enable quota exceeded simulation
      mockLocalStorage.setQuotaExceeded(true);

      expect(() => {
        StorageManager.createUser({
          name: "Test User",
          preferences: defaultUserPreferences,
          statistics: defaultUserStatistics,
        });
      }).toThrow();
    });

    test("should handle corrupted data parsing efficiently", () => {
      // Mock corrupted localStorage data
      mockLocalStorage.getItem.mockReturnValueOnce("invalid json{{{");

      const startTime = performance.now();

      // StorageManager handles corrupted data gracefully by returning default data
      const data = StorageManager.initialize();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle gracefully and return default data
      expect(data.users).toEqual([]);
      expect(data.sessions).toEqual([]);
      expect(duration).toBeLessThan(100); // Should handle quickly
    });
  });

  describe("Concurrent Operations", () => {
    test("should handle multiple simultaneous read operations", async () => {
      const user = StorageManager.createUser({
        name: "Test User",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      const startTime = performance.now();

      // Simulate concurrent read operations
      const readPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(StorageManager.getUserById(user.id)),
      );

      const results = await Promise.all(readPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(results.every((result) => result?.id === user.id)).toBe(true);
      expect(duration).toBeLessThan(100); // Should be very fast for reads
    });

    test("should handle write operations under load", () => {
      const user = StorageManager.createUser({
        name: "Test User",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      const startTime = performance.now();

      // Perform multiple updates
      for (let i = 0; i < 20; i++) {
        StorageManager.updateUser(user.id, {
          preferences: {
            ...user.preferences,
            sessionLength: 5 + (i % 10),
          },
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should complete within 200ms

      const updatedUser = StorageManager.getUserById(user.id);
      expect(updatedUser?.preferences.sessionLength).toBe(14); // 5 + (19 % 10)
    });
  });
});
