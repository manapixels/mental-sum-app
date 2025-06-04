import { StorageManager } from "@/lib/storage";
import { ProblemEngine } from "@/lib/problem-engine";
import {
  defaultUserPreferences,
  defaultUserStatistics,
  Session,
} from "@/lib/types";

// Mock localStorage for end-to-end testing
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

describe("End-to-End User Journey Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    // Initialize storage to ensure proper state
    StorageManager.initialize();
  });

  describe("Complete User Workflow", () => {
    test("should complete full user journey from creation to session completion", () => {
      // Step 1: Create user
      const user = StorageManager.createUser({
        name: "E2E Test User",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      expect(user).toBeDefined();
      expect(user.name).toBe("E2E Test User");

      // Verify user was created properly
      const retrievedUser = StorageManager.getUserById(user.id);
      expect(retrievedUser).toBeDefined();

      // Step 2: Update user preferences
      const updatedUser = StorageManager.updateUser(user.id, {
        preferences: {
          ...retrievedUser!.preferences,
          sessionLength: 10,
        },
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.preferences.sessionLength).toBe(10);

      // Step 3: Generate problems for session
      const problems = [];
      for (let i = 0; i < 5; i++) {
        const problem = ProblemEngine.generateProblem(
          updatedUser!.preferences,
          updatedUser!.statistics,
          null,
        );
        if (problem) {
          problems.push({
            ...problem,
            userAnswer: problem.correctAnswer,
            isCorrect: true,
            timeSpent: 5000,
            completedAt: new Date(),
          });
        }
      }

      expect(problems.length).toBeGreaterThan(0);

      // Step 4: Create and complete session with proper structure
      const sessionData = {
        userId: user.id,
        startTime: new Date(Date.now() - 300000),
        endTime: new Date(),
        problems: problems,
        completed: true,
        totalCorrect: problems.filter((p) => p.isCorrect).length,
        totalWrong: problems.filter((p) => !p.isCorrect).length,
        averageTime: 5000,
        sessionLength: problems.length,
      };

      const session = StorageManager.createSession(sessionData);

      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.totalCorrect).toBe(problems.length);

      // Step 5: Verify data persistence
      const finalUser = StorageManager.getUserById(user.id);
      const finalSession = StorageManager.getSessionById(session.id);

      expect(finalUser).toBeDefined();
      expect(finalSession).toBeDefined();
      expect(finalSession?.problems).toHaveLength(problems.length);
    });

    test("should handle session with mixed correct/incorrect answers", () => {
      // Create user
      const user = StorageManager.createUser({
        name: "Mixed Performance Student",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      // Generate problems
      const problems = [];
      for (let i = 0; i < 10; i++) {
        const problem = ProblemEngine.generateProblem(
          user!.preferences,
          user!.statistics,
        );
        problems.push(problem!);
      }

      // Simulate mixed performance (70% correct)
      const completedProblems = problems.map((problem, index) => ({
        ...problem,
        userAnswer:
          index < 7 ? problem.correctAnswer : problem.correctAnswer + 1, // First 7 correct
        isCorrect: index < 7,
        timeSpent: 2000 + Math.random() * 4000, // 2-6 seconds
        attemptedAt: new Date(),
      }));

      const session: Session = {
        id: `session-mixed-${Date.now()}`,
        userId: user!.id,
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        endTime: new Date(),
        problems: completedProblems,
        completed: true,
        totalCorrect: 7,
        totalWrong: 3,
        averageTime:
          completedProblems.reduce((acc, p) => acc + p.timeSpent, 0) /
          completedProblems.length,
        sessionLength: 10,
      };

      const savedSession = StorageManager.createSession(session);
      expect(savedSession?.totalCorrect).toBe(7);
      expect(savedSession?.totalWrong).toBe(3);

      // Calculate accuracy
      const accuracy =
        (savedSession!.totalCorrect / savedSession!.sessionLength) * 100;
      expect(accuracy).toBe(70);
    });

    test("should handle incomplete session gracefully", () => {
      // Create user
      const user = StorageManager.createUser({
        name: "Interrupted Student",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      // Generate partial session (user quit early)
      const problems = [];
      for (let i = 0; i < 3; i++) {
        // Only completed 3 out of planned 10
        const problem = ProblemEngine.generateProblem(
          user!.preferences,
          user!.statistics,
        );
        problems.push({
          ...problem!,
          userAnswer: problem!.correctAnswer,
          isCorrect: true,
          timeSpent: 3000,
          attemptedAt: new Date(),
        });
      }

      const incompleteSession: Session = {
        id: `session-incomplete-${Date.now()}`,
        userId: user!.id,
        startTime: new Date(Date.now() - 120000), // 2 minutes ago
        endTime: new Date(),
        problems,
        completed: false, // Session was not completed
        totalCorrect: 3,
        totalWrong: 0,
        averageTime: 3000,
        sessionLength: 3, // Actual length, not planned length
      };

      const savedSession = StorageManager.createSession(incompleteSession);
      expect(savedSession?.completed).toBe(false);
      expect(savedSession?.sessionLength).toBe(3);
    });
  });

  describe("Multi-User Scenarios", () => {
    test("should handle multiple users with independent data", () => {
      // Create two users with different preferences
      const user1 = StorageManager.createUser({
        name: "User One",
        preferences: {
          ...defaultUserPreferences,
          sessionLength: 5,
        },
        statistics: defaultUserStatistics,
      });

      const user2 = StorageManager.createUser({
        name: "User Two",
        preferences: {
          ...defaultUserPreferences,
          sessionLength: 8,
        },
        statistics: defaultUserStatistics,
      });

      // Create sessions for each user
      const session1Data = {
        userId: user1.id,
        startTime: new Date(),
        endTime: new Date(),
        problems: [],
        completed: true,
        totalCorrect: 3,
        totalWrong: 2,
        averageTime: 4500,
        sessionLength: 5,
      };

      const session2Data = {
        userId: user2.id,
        startTime: new Date(),
        endTime: new Date(),
        problems: [],
        completed: true,
        totalCorrect: 6,
        totalWrong: 2,
        averageTime: 5200,
        sessionLength: 8,
      };

      const session1 = StorageManager.createSession(session1Data);
      const session2 = StorageManager.createSession(session2Data);

      // Verify data isolation using direct queries
      const user1Sessions = StorageManager.getSessionsByUser(user1.id);
      const user2Sessions = StorageManager.getSessionsByUser(user2.id);

      expect(user1Sessions).toHaveLength(1);
      expect(user2Sessions).toHaveLength(1);
      expect(session1.sessionLength).toBe(5);
      expect(session2.sessionLength).toBe(8);
    });

    test("should handle user deletion with cleanup", () => {
      // Create user and session
      const user = StorageManager.createUser({
        name: "Temp User",
        preferences: defaultUserPreferences,
        statistics: defaultUserStatistics,
      });

      const sessionData = {
        userId: user.id,
        startTime: new Date(),
        endTime: new Date(),
        problems: [],
        completed: true,
        totalCorrect: 1,
        totalWrong: 0,
        averageTime: 3000,
        sessionLength: 1,
      };

      const session = StorageManager.createSession(sessionData);

      // Verify user and session exist
      expect(StorageManager.getUserById(user.id)).toBeDefined();
      expect(session.userId).toBe(user.id);
      const userSessions = StorageManager.getSessionsByUser(user.id);
      expect(userSessions).toHaveLength(1);

      // Delete user
      const success = StorageManager.deleteUser(user.id);
      expect(success).toBe(true);

      // Verify cleanup
      expect(StorageManager.getUserById(user.id)).toBeNull();
      const remainingSessions = StorageManager.getSessionsByUser(user.id);
      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe("Data Persistence and Recovery", () => {
    test("should maintain data consistency across app restarts", () => {
      // Simulate app startup with existing data
      const existingData = {
        users: [
          {
            id: "existing-user",
            name: "Returning Student",
            createdAt: new Date().toISOString(),
            preferences: defaultUserPreferences,
            statistics: {
              ...defaultUserStatistics,
              totalProblems: 50,
              correctAnswers: 42,
              totalSessions: 5,
            },
          },
        ],
        currentUserId: "existing-user",
        sessions: [
          {
            id: "existing-session",
            userId: "existing-user",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            problems: [],
            completed: true,
            totalCorrect: 8,
            totalWrong: 2,
            averageTime: 3500,
            sessionLength: 10,
          },
        ],
        version: "1.0.0",
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      // Initialize app with existing data
      const loadedData = StorageManager.initialize();

      expect(loadedData.users).toHaveLength(1);
      expect(loadedData.sessions).toHaveLength(1);
      expect(loadedData.currentUserId).toBe("existing-user");

      const user = loadedData.users[0];
      expect(user.statistics.totalProblems).toBe(50);
      expect(user.statistics.correctAnswers).toBe(42);
    });

    test("should handle corrupted data gracefully", () => {
      // Simulate corrupted localStorage data
      mockLocalStorage.getItem.mockReturnValue("invalid json data");

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // App should initialize with default state
      const data = StorageManager.initialize();
      expect(data.users).toHaveLength(0);
      expect(data.sessions).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
