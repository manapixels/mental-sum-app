import { StorageManager } from "@/lib/storage";
import {
  User,
  Session,
  AppData,
  defaultUserPreferences,
  defaultUserStatistics,
} from "@/lib/types";

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test data
const mockUser1: Omit<User, "id" | "createdAt"> = {
  name: "Test User 1",
  preferences: defaultUserPreferences,
  statistics: defaultUserStatistics,
};

const mockUser2: Omit<User, "id" | "createdAt"> = {
  name: "Test User 2",
  preferences: { ...defaultUserPreferences, difficultyLevel: "advanced" },
  statistics: { ...defaultUserStatistics, totalProblems: 25 },
};

const mockSession: Omit<Session, "id"> = {
  userId: "user-1",
  startTime: new Date("2024-01-01T10:00:00Z"),
  endTime: new Date("2024-01-01T10:30:00Z"),
  problems: [],
  completed: true,
  totalCorrect: 8,
  totalWrong: 2,
  averageTime: 15,
  sessionLength: 10,
};

describe("StorageManager", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Mock console.error to prevent test output pollution during error testing
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Reset localStorage mock to default behavior
    mockLocalStorage.getItem.mockReturnValue(null);

    // Don't call initialize() here - let each test control when it's called
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("initialize", () => {
    test("should create default data when localStorage is empty", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const data = StorageManager.initialize();

      expect(data).toEqual({
        users: [],
        currentUserId: undefined,
        sessions: [],
        version: "1.0.0",
        lastBackup: expect.any(Date),
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "mental-sum-app-data",
        expect.any(String),
      );
    });

    test("should return existing data when localStorage has valid data", () => {
      const existingData: AppData = {
        users: [],
        currentUserId: undefined,
        sessions: [],
        version: "1.0.0",
        lastBackup: new Date("2024-01-01T00:00:00Z"),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      const data = StorageManager.initialize();

      expect(data.version).toBe("1.0.0");
      expect(data.users).toEqual([]);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    test("should handle corrupted localStorage data gracefully", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const data = StorageManager.initialize();

      expect(data).toEqual({
        users: [],
        currentUserId: undefined,
        sessions: [],
        version: "1.0.0",
        lastBackup: expect.any(Date),
      });
    });
  });

  describe("User Management", () => {
    describe("createUser", () => {
      test("should create a new user with generated ID and timestamp", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const newUser = StorageManager.createUser(mockUser1);

        expect(newUser).toEqual({
          ...mockUser1,
          id: expect.any(String),
          createdAt: expect.any(Date),
        });

        expect(newUser.id).toMatch(/^[0-9a-f-]+$/i); // UUID format
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      test("should set first user as current user automatically", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const newUser = StorageManager.createUser(mockUser1);

        // Verify that setItem was called with data containing the new user as current
        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData.currentUserId).toBe(newUser.id);
        expect(savedData.users).toHaveLength(1);
      });

      test("should not change current user when adding subsequent users", () => {
        const existingUser = {
          ...mockUser1,
          id: "existing-user",
          createdAt: new Date(),
        };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [existingUser],
            currentUserId: "existing-user",
            sessions: [],
            version: "1.0.0",
          }),
        );

        StorageManager.createUser(mockUser2);

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData.currentUserId).toBe("existing-user");
        expect(savedData.users).toHaveLength(2);
      });
    });

    describe("getUserById", () => {
      test("should return user when found", () => {
        const testUser = { ...mockUser1, id: "test-id", createdAt: new Date() };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [testUser],
            currentUserId: "test-id",
            sessions: [],
            version: "1.0.0",
          }),
        );

        const foundUser = StorageManager.getUserById("test-id");

        expect(foundUser).toEqual(testUser);
      });

      test("should return null when user not found", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const foundUser = StorageManager.getUserById("non-existent");

        expect(foundUser).toBeNull();
      });
    });

    describe("updateUser", () => {
      test("should update user successfully", () => {
        const testUser = { ...mockUser1, id: "test-id", createdAt: new Date() };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [testUser],
            currentUserId: "test-id",
            sessions: [],
            version: "1.0.0",
          }),
        );

        const updates = { name: "Updated Name" };
        const updatedUser = StorageManager.updateUser("test-id", updates);

        expect(updatedUser).toEqual({
          ...testUser,
          name: "Updated Name",
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      test("should preserve ID and createdAt when updating", () => {
        const originalDate = new Date("2024-01-01T00:00:00Z");
        const testUser = {
          ...mockUser1,
          id: "test-id",
          createdAt: originalDate,
        };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [testUser],
            currentUserId: "test-id",
            sessions: [],
            version: "1.0.0",
          }),
        );

        const maliciousUpdates = {
          id: "hacked-id",
          createdAt: new Date(),
          name: "Updated Name",
        };
        const updatedUser = StorageManager.updateUser(
          "test-id",
          maliciousUpdates,
        );

        expect(updatedUser?.id).toBe("test-id");
        expect(updatedUser?.createdAt).toEqual(originalDate);
        expect(updatedUser?.name).toBe("Updated Name");
      });

      test("should return null when user not found", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const updatedUser = StorageManager.updateUser("non-existent", {
          name: "New Name",
        });

        expect(updatedUser).toBeNull();
      });
    });

    describe("deleteUser", () => {
      test("should delete user and associated sessions", () => {
        const testUser = { ...mockUser1, id: "test-id", createdAt: new Date() };
        const testSession = {
          ...mockSession,
          id: "session-1",
          userId: "test-id",
        };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [testUser],
            currentUserId: "test-id",
            sessions: [testSession],
            version: "1.0.0",
          }),
        );

        const success = StorageManager.deleteUser("test-id");

        expect(success).toBe(true);

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData.users).toHaveLength(0);
        expect(savedData.sessions).toHaveLength(0);
        expect(savedData.currentUserId).toBeUndefined();
      });

      test("should update current user when deleting current user", () => {
        const user1 = { ...mockUser1, id: "user-1", createdAt: new Date() };
        const user2 = { ...mockUser2, id: "user-2", createdAt: new Date() };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [user1, user2],
            currentUserId: "user-1",
            sessions: [],
            version: "1.0.0",
          }),
        );

        const success = StorageManager.deleteUser("user-1");

        expect(success).toBe(true);

        const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
        expect(savedData.users).toHaveLength(1);
        expect(savedData.currentUserId).toBe("user-2");
      });

      test("should return false when user not found", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const success = StorageManager.deleteUser("non-existent");

        expect(success).toBe(false);
      });
    });

    describe("getCurrentUser", () => {
      test("should return current user when set", () => {
        const testUser = { ...mockUser1, id: "test-id", createdAt: new Date() };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [testUser],
            currentUserId: "test-id",
            sessions: [],
            version: "1.0.0",
          }),
        );

        const currentUser = StorageManager.getCurrentUser();

        expect(currentUser).toEqual(testUser);
      });

      test("should return null when no current user set", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const currentUser = StorageManager.getCurrentUser();

        expect(currentUser).toBeNull();
      });
    });
  });

  describe("Session Management", () => {
    describe("createSession", () => {
      test("should create session with generated ID", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [],
            version: "1.0.0",
          }),
        );

        const newSession = StorageManager.createSession(mockSession);

        expect(newSession).toEqual({
          ...mockSession,
          id: expect.any(String),
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe("updateSession", () => {
      test("should update session successfully", () => {
        const testSession = { ...mockSession, id: "session-1" };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [testSession],
            version: "1.0.0",
          }),
        );

        const updates = { completed: false, totalCorrect: 5 };
        const updatedSession = StorageManager.updateSession(
          "session-1",
          updates,
        );

        expect(updatedSession).toEqual({
          ...testSession,
          completed: false,
          totalCorrect: 5,
        });
      });

      test("should preserve session ID when updating", () => {
        const testSession = { ...mockSession, id: "session-1" };
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [testSession],
            version: "1.0.0",
          }),
        );

        const maliciousUpdates = { id: "hacked-id", completed: false };
        const updatedSession = StorageManager.updateSession(
          "session-1",
          maliciousUpdates,
        );

        expect(updatedSession?.id).toBe("session-1");
      });
    });

    describe("getSessionsByUser", () => {
      test("should return sessions for specific user", () => {
        const session1 = { ...mockSession, id: "session-1", userId: "user-1" };
        const session2 = { ...mockSession, id: "session-2", userId: "user-2" };
        const session3 = { ...mockSession, id: "session-3", userId: "user-1" };

        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({
            users: [],
            currentUserId: undefined,
            sessions: [session1, session2, session3],
            version: "1.0.0",
          }),
        );

        const userSessions = StorageManager.getSessionsByUser("user-1");

        expect(userSessions).toHaveLength(2);
        expect(userSessions.map((s) => s.id)).toEqual([
          "session-1",
          "session-3",
        ]);
      });
    });
  });

  describe("Data Export/Import", () => {
    describe("exportData", () => {
      test("should export data as JSON string", () => {
        const testData = {
          users: [],
          currentUserId: undefined,
          sessions: [],
          version: "1.0.0",
          lastBackup: new Date(),
        };

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

        const exportedData = StorageManager.exportData();

        expect(typeof exportedData).toBe("string");
        const parsed = JSON.parse(exportedData);
        expect(parsed.version).toBe("1.0.0");
      });
    });

    describe("importData", () => {
      test("should import valid JSON data successfully", () => {
        const validData = {
          users: [],
          currentUserId: undefined,
          sessions: [],
          version: "1.0.0",
        };

        const success = StorageManager.importData(JSON.stringify(validData));

        expect(success).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      test("should reject invalid JSON data", () => {
        const invalidData = "invalid json";

        const success = StorageManager.importData(invalidData);

        expect(success).toBe(false);
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      });

      test("should reject data with invalid structure", () => {
        const invalidStructure = {
          users: "not an array",
          version: "1.0.0",
        };

        const success = StorageManager.importData(
          JSON.stringify(invalidStructure),
        );

        expect(success).toBe(false);
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe("Utility Functions", () => {
    describe("clearAllData", () => {
      test("should remove data from localStorage", () => {
        StorageManager.clearAllData();

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
          "mental-sum-app-data",
        );
      });
    });

    describe("getStorageSize", () => {
      test("should return size of stored data", () => {
        const testData = JSON.stringify({ test: "data" });
        mockLocalStorage.getItem.mockReturnValue(testData);

        const size = StorageManager.getStorageSize();

        expect(size).toBeGreaterThan(0);
        expect(typeof size).toBe("number");
      });

      test("should return 0 when no data stored", () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const size = StorageManager.getStorageSize();

        expect(size).toBe(0);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle localStorage quota exceeded gracefully", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => {
        StorageManager.createUser(mockUser1);
      }).toThrow("Failed to save data. Storage might be full.");
    });

    test("should handle localStorage read errors gracefully", () => {
      // Reset the mock first
      mockLocalStorage.setItem.mockReset();
      mockLocalStorage.setItem.mockImplementation(() => {}); // Normal behavior for setItem

      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("SecurityError");
      });

      const data = StorageManager.initialize();

      expect(data).toEqual({
        users: [],
        currentUserId: undefined,
        sessions: [],
        version: "1.0.0",
        lastBackup: expect.any(Date),
      });
    });
  });

  describe("Date Handling", () => {
    test("should properly serialize and deserialize dates", () => {
      const testDate = new Date("2024-01-01T10:00:00Z");
      const testUser = {
        ...mockUser1,
        id: "test-id",
        createdAt: testDate,
      };
      const testSession = {
        ...mockSession,
        id: "session-1",
        startTime: testDate,
        endTime: testDate,
        problems: [
          {
            id: "problem-1",
            type: "addition" as const,
            operands: [1, 2] as [number, number],
            correctAnswer: 3,
            intendedStrategy: "AdditionDoubles" as const,
            difficulty: "beginner" as const,
            timeSpent: 5,
            attemptedAt: testDate,
            completedAt: testDate,
          },
        ],
      };

      const testData = {
        users: [testUser],
        currentUserId: "test-id",
        sessions: [testSession],
        version: "1.0.0",
        lastBackup: testDate,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const user = StorageManager.getUserById("test-id");
      const session = StorageManager.getSessionById("session-1");

      expect(user?.createdAt).toBeInstanceOf(Date);
      expect(session?.startTime).toBeInstanceOf(Date);
      expect(session?.endTime).toBeInstanceOf(Date);
      expect(session?.problems[0].attemptedAt).toBeInstanceOf(Date);
      expect(session?.problems[0].completedAt).toBeInstanceOf(Date);
    });
  });
});
