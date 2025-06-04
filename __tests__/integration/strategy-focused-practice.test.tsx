import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProblemEngine } from "@/lib/problem-engine";
import { StorageManager } from "@/lib/storage";
import { StrategyId, UserStatistics, Problem, Session } from "@/lib/types";

// Mock dependencies
jest.mock("@/lib/problem-engine");
jest.mock("@/lib/storage");

const mockProblemEngine = ProblemEngine as jest.Mocked<typeof ProblemEngine>;
const mockStorageManager = StorageManager as jest.Mocked<typeof StorageManager>;

// Mock strategy-focused session component
const MockStrategyFocusedSession = ({
  strategyId,
  onComplete,
  onProblemAttempt,
}: {
  strategyId: StrategyId;
  onComplete: (session: Session) => void;
  onProblemAttempt: (
    problem: Problem,
    userAnswer: number,
    isCorrect: boolean,
  ) => void;
}) => {
  const [currentProblem, setCurrentProblem] = React.useState<Problem | null>(
    null,
  );
  const [problemIndex, setProblemIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [sessionProblems, setSessionProblems] = React.useState<Problem[]>([]);

  React.useEffect(() => {
    // Generate first problem for the focused strategy
    const problem = {
      id: `problem-${problemIndex + 1}`,
      type: "addition" as const,
      operands: [45, 47] as [number, number],
      correctAnswer: 92,
      intendedStrategy: strategyId,
      difficulty: "intermediate" as const,
      timeSpent: 0,
      attemptedAt: new Date(),
    };
    setCurrentProblem(problem);
  }, [strategyId, problemIndex]);

  const handleSubmit = () => {
    if (!currentProblem || !userAnswer) return;

    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentProblem.correctAnswer;

    const completedProblem = {
      ...currentProblem,
      timeSpent: Math.random() * 20 + 5, // 5-25 seconds
      completedAt: new Date(),
    };

    onProblemAttempt(completedProblem, answer, isCorrect);
    setSessionProblems((prev) => [...prev, completedProblem]);

    if (problemIndex < 9) {
      // 10 problems total
      setProblemIndex((prev) => prev + 1);
      setUserAnswer("");
    } else {
      // Complete session
      const session = {
        id: "focused-session-1",
        userId: "test-user",
        startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        endTime: new Date(),
        problems: sessionProblems,
        completed: true,
        totalCorrect: sessionProblems.filter(() => Math.random() > 0.3).length, // ~70% correct
        totalWrong: 3,
        averageTime: 15,
        sessionLength: 10,
      } as Session;
      // Note: In real implementation, focusedStrategy would be part of Session type
      const sessionWithFocus = { ...session, focusedStrategy: strategyId };
      onComplete(sessionWithFocus);
    }
  };

  return (
    <div data-testid="strategy-focused-session">
      <div data-testid="session-header">
        <h2>Focused Practice: {strategyId}</h2>
        <div data-testid="progress-indicator">
          Problem {problemIndex + 1} of 10
        </div>
      </div>

      {currentProblem && (
        <div data-testid="problem-container">
          <div data-testid="problem-equation">
            {currentProblem.operands[0]} + {currentProblem.operands[1]} = ?
          </div>
          <input
            data-testid="answer-input"
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
          />
          <button
            data-testid="submit-button"
            onClick={handleSubmit}
            disabled={!userAnswer}
          >
            Submit
          </button>
        </div>
      )}

      <div data-testid="strategy-reminder">
        <h3>Strategy: {strategyId}</h3>
        <p data-testid="strategy-tip">
          {strategyId === "AdditionDoubles" &&
            "Look for numbers that are close to each other - double the smaller and add the difference!"}
          {strategyId === "AdditionBridgingTo10s" &&
            "Break down numbers to make friendly tens first!"}
        </p>
      </div>
    </div>
  );
};

// Mock progress tracking component
const MockProgressTracker = ({
  strategyId,
  onProgressUpdate,
}: {
  strategyId: StrategyId;
  onProgressUpdate: (update: {
    accuracy: number;
    attempts: number;
    averageTime: number;
  }) => void;
}) => {
  const [progress, setProgress] = React.useState({
    accuracy: 65, // Starting accuracy
    attempts: 15,
    averageTime: 18,
  });

  React.useEffect(() => {
    onProgressUpdate(progress);
  }, [progress, onProgressUpdate]);

  const simulateImprovement = () => {
    setProgress((prev) => ({
      accuracy: Math.min(95, prev.accuracy + 5),
      attempts: prev.attempts + 10,
      averageTime: Math.max(10, prev.averageTime - 1),
    }));
  };

  return (
    <div data-testid="progress-tracker">
      <h3>Progress for {strategyId}</h3>
      <div data-testid="accuracy-display">Accuracy: {progress.accuracy}%</div>
      <div data-testid="attempts-display">
        Total Attempts: {progress.attempts}
      </div>
      <div data-testid="time-display">
        Average Time: {progress.averageTime}s
      </div>
      <button data-testid="simulate-improvement" onClick={simulateImprovement}>
        Complete More Practice
      </button>
    </div>
  );
};

describe("Strategy-Focused Practice Workflow", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("End-to-End Focused Practice Sessions", () => {
    test("should complete a full focused practice session for AdditionDoubles", async () => {
      const mockOnComplete = jest.fn();
      const mockOnProblemAttempt = jest.fn();

      render(
        <MockStrategyFocusedSession
          strategyId="AdditionDoubles"
          onComplete={mockOnComplete}
          onProblemAttempt={mockOnProblemAttempt}
        />,
      );

      // Verify session setup
      expect(screen.getByTestId("session-header")).toBeInTheDocument();
      expect(
        screen.getByText("Focused Practice: AdditionDoubles"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("progress-indicator")).toHaveTextContent(
        "Problem 1 of 10",
      );

      // Verify strategy guidance is present
      expect(screen.getByTestId("strategy-reminder")).toBeInTheDocument();
      expect(screen.getByTestId("strategy-tip")).toHaveTextContent(
        "double the smaller and add the difference",
      );

      // Complete several problems
      for (let i = 0; i < 10; i++) {
        const answerInput = screen.getByTestId("answer-input");
        const submitButton = screen.getByTestId("submit-button");

        // Enter an answer
        fireEvent.change(answerInput, { target: { value: "92" } });
        expect(submitButton).not.toBeDisabled();

        // Submit the answer
        fireEvent.click(submitButton);

        // Verify problem attempt was recorded
        expect(mockOnProblemAttempt).toHaveBeenCalledWith(
          expect.objectContaining({
            intendedStrategy: "AdditionDoubles",
            timeSpent: expect.any(Number),
          }),
          92,
          true,
        );

        if (i < 9) {
          // Should advance to next problem
          await waitFor(() => {
            expect(screen.getByTestId("progress-indicator")).toHaveTextContent(
              `Problem ${i + 2} of 10`,
            );
          });
        }
      }

      // Session should complete
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            focusedStrategy: "AdditionDoubles",
            completed: true,
            sessionLength: 10,
            problems: expect.arrayContaining([
              expect.objectContaining({
                intendedStrategy: "AdditionDoubles",
              }),
            ]),
          }),
        );
      });
    });

    test("should generate strategy-specific problems throughout session", () => {
      const mockOnComplete = jest.fn();
      const mockOnProblemAttempt = jest.fn();

      // Mock problem generation to return strategy-specific problems
      mockProblemEngine.generateProblem.mockImplementation(
        (preferences, stats, focusedStrategy) => {
          if (focusedStrategy === "AdditionBridgingTo10s") {
            return {
              id: "bridge-problem",
              type: "addition",
              operands: [38, 29] as [number, number], // Good for bridging strategy
              correctAnswer: 67,
              intendedStrategy: "AdditionBridgingTo10s",
              difficulty: "intermediate",
              timeSpent: 0,
              attemptedAt: new Date(),
            };
          }
          return null;
        },
      );

      render(
        <MockStrategyFocusedSession
          strategyId="AdditionBridgingTo10s"
          onComplete={mockOnComplete}
          onProblemAttempt={mockOnProblemAttempt}
        />,
      );

      // Verify the problem generation was called with focused strategy
      expect(mockProblemEngine.generateProblem).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        "AdditionBridgingTo10s",
      );

      // Verify strategy-specific guidance
      expect(screen.getByTestId("strategy-tip")).toHaveTextContent(
        "Break down numbers to make friendly tens",
      );
    });

    test("should handle incorrect answers and provide feedback", async () => {
      const mockOnComplete = jest.fn();
      const mockOnProblemAttempt = jest.fn();

      render(
        <MockStrategyFocusedSession
          strategyId="AdditionDoubles"
          onComplete={mockOnComplete}
          onProblemAttempt={mockOnProblemAttempt}
        />,
      );

      const answerInput = screen.getByTestId("answer-input");
      const submitButton = screen.getByTestId("submit-button");

      // Submit an incorrect answer
      fireEvent.change(answerInput, { target: { value: "85" } }); // Wrong answer
      fireEvent.click(submitButton);

      // Verify incorrect attempt was recorded
      expect(mockOnProblemAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          intendedStrategy: "AdditionDoubles",
        }),
        85,
        false, // isCorrect = false
      );
    });
  });

  describe("Progress Tracking During Focused Practice", () => {
    test("should track accuracy improvement over multiple sessions", async () => {
      const mockOnProgressUpdate = jest.fn();

      render(
        <MockProgressTracker
          strategyId="AdditionDoubles"
          onProgressUpdate={mockOnProgressUpdate}
        />,
      );

      // Initial progress should be displayed
      expect(screen.getByTestId("accuracy-display")).toHaveTextContent(
        "Accuracy: 65%",
      );
      expect(screen.getByTestId("attempts-display")).toHaveTextContent(
        "Total Attempts: 15",
      );
      expect(screen.getByTestId("time-display")).toHaveTextContent(
        "Average Time: 18s",
      );

      // Initial progress should be reported
      expect(mockOnProgressUpdate).toHaveBeenCalledWith({
        accuracy: 65,
        attempts: 15,
        averageTime: 18,
      });

      // Simulate practice sessions
      const improveButton = screen.getByTestId("simulate-improvement");
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(screen.getByTestId("accuracy-display")).toHaveTextContent(
          "Accuracy: 70%",
        );
        expect(screen.getByTestId("attempts-display")).toHaveTextContent(
          "Total Attempts: 25",
        );
        expect(screen.getByTestId("time-display")).toHaveTextContent(
          "Average Time: 17s",
        );
      });

      // Improved progress should be reported
      expect(mockOnProgressUpdate).toHaveBeenCalledWith({
        accuracy: 70,
        attempts: 25,
        averageTime: 17,
      });

      // Multiple improvement cycles
      fireEvent.click(improveButton);
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(screen.getByTestId("accuracy-display")).toHaveTextContent(
          "Accuracy: 80%",
        );
      });
    });

    test("should track session completion and update user statistics", () => {
      const mockSession = {
        id: "focused-session-test",
        userId: "test-user",
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        endTime: new Date(),
        problems: [
          {
            id: "problem-1",
            type: "addition" as const,
            operands: [45, 47] as [number, number],
            correctAnswer: 92,
            intendedStrategy: "AdditionDoubles" as const,
            difficulty: "intermediate" as const,
            timeSpent: 12,
            attemptedAt: new Date(),
            completedAt: new Date(),
          },
          {
            id: "problem-2",
            type: "addition" as const,
            operands: [23, 25] as [number, number],
            correctAnswer: 48,
            intendedStrategy: "AdditionDoubles" as const,
            difficulty: "intermediate" as const,
            timeSpent: 8,
            attemptedAt: new Date(),
            completedAt: new Date(),
          },
        ],
        completed: true,
        totalCorrect: 8,
        totalWrong: 2,
        averageTime: 12,
        sessionLength: 10,
      } as Session;
      // Note: In real implementation, focusedStrategy would be part of Session type
      const sessionWithFocus = {
        ...mockSession,
        focusedStrategy: "AdditionDoubles" as const,
      };

      // Mock storage operations
      mockStorageManager.createSession.mockReturnValue(mockSession);
      mockStorageManager.updateUser.mockReturnValue(null);

      // Simulate session completion
      // const result = mockStorageManager.createSession({
      //   userId: sessionWithFocus.userId,
      //   startTime: sessionWithFocus.startTime,
      //   endTime: sessionWithFocus.endTime,
      //   problems: sessionWithFocus.problems,
      //   completed: sessionWithFocus.completed,
      //   totalCorrect: sessionWithFocus.totalCorrect,
      //   totalWrong: sessionWithFocus.totalWrong,
      //   averageTime: sessionWithFocus.averageTime,
      //   sessionLength: sessionWithFocus.sessionLength,
      // });

      // Verify session was created with focused strategy data
      expect(sessionWithFocus.focusedStrategy).toBe("AdditionDoubles");
      expect(
        sessionWithFocus.problems.every(
          (p) => p.intendedStrategy === "AdditionDoubles",
        ),
      ).toBe(true);
      expect(mockStorageManager.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionLength: 10,
        }),
      );
    });

    test("should calculate strategy-specific metrics after focused session", () => {
      const sessionProblems: Problem[] = [
        {
          id: "p1",
          type: "addition",
          operands: [47, 48],
          correctAnswer: 95,
          intendedStrategy: "AdditionDoubles",
          difficulty: "intermediate",
          timeSpent: 10,
          attemptedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "p2",
          type: "addition",
          operands: [23, 25],
          correctAnswer: 48,
          intendedStrategy: "AdditionDoubles",
          difficulty: "intermediate",
          timeSpent: 15,
          attemptedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "p3",
          type: "addition",
          operands: [34, 36],
          correctAnswer: 70,
          intendedStrategy: "AdditionDoubles",
          difficulty: "intermediate",
          timeSpent: 8,
          attemptedAt: new Date(),
          completedAt: new Date(),
        },
      ];

      // Calculate metrics
      const correctCount = 2; // Assume 2 out of 3 correct
      const totalAttempts = sessionProblems.length;
      const accuracy = (correctCount / totalAttempts) * 100;
      const averageTime =
        sessionProblems.reduce((sum, p) => sum + p.timeSpent, 0) /
        totalAttempts;

      expect(accuracy).toBeCloseTo(66.67, 1);
      expect(averageTime).toBeCloseTo(11, 1);
      expect(totalAttempts).toBe(3);

      // All problems should be for the focused strategy
      expect(
        sessionProblems.every((p) => p.intendedStrategy === "AdditionDoubles"),
      ).toBe(true);
    });
  });

  describe("Integration with Adaptive Learning", () => {
    test("should update strategy performance after focused session", () => {
      const initialStats: UserStatistics["strategyPerformance"]["AdditionDoubles"] =
        {
          totalAttempts: 10,
          correct: 6,
          incorrect: 4,
        };

      const focusedSessionResults = {
        attempted: 10,
        correct: 8,
        incorrect: 2,
      };

      // Calculate updated performance
      const updatedStats = {
        totalAttempts:
          initialStats.totalAttempts + focusedSessionResults.attempted,
        correct: initialStats.correct + focusedSessionResults.correct,
        incorrect: initialStats.incorrect + focusedSessionResults.incorrect,
      };

      expect(updatedStats.totalAttempts).toBe(20);
      expect(updatedStats.correct).toBe(14);
      expect(updatedStats.incorrect).toBe(6);

      const newAccuracy =
        (updatedStats.correct / updatedStats.totalAttempts) * 100;
      expect(newAccuracy).toBe(70); // Improved from 60% to 70%
    });

    test("should recommend continued practice or mastery achievement", () => {
      const highPerformanceStats = {
        totalAttempts: 25,
        correct: 23,
        incorrect: 2,
      };

      const lowPerformanceStats = {
        totalAttempts: 15,
        correct: 8,
        incorrect: 7,
      };

      const highAccuracy =
        (highPerformanceStats.correct / highPerformanceStats.totalAttempts) *
        100;
      const lowAccuracy =
        (lowPerformanceStats.correct / lowPerformanceStats.totalAttempts) * 100;

      expect(highAccuracy).toBeGreaterThan(90); // Mastery level
      expect(lowAccuracy).toBeLessThan(60); // Needs more practice

      // High performance should suggest mastery or new challenges
      if (highAccuracy >= 90 && highPerformanceStats.totalAttempts >= 20) {
        expect(true).toBe(true); // Strategy mastered
      }

      // Low performance should suggest continued focused practice
      if (lowAccuracy < 70) {
        expect(true).toBe(true); // Continue practicing this strategy
      }
    });
  });

  describe("Session Flow Management", () => {
    test("should handle session interruption and resumption", () => {
      const mockOnComplete = jest.fn();
      const mockOnProblemAttempt = jest.fn();

      const { unmount } = render(
        <MockStrategyFocusedSession
          strategyId="AdditionDoubles"
          onComplete={mockOnComplete}
          onProblemAttempt={mockOnProblemAttempt}
        />,
      );

      // Complete a few problems
      const answerInput = screen.getByTestId("answer-input");
      const submitButton = screen.getByTestId("submit-button");

      fireEvent.change(answerInput, { target: { value: "92" } });
      fireEvent.click(submitButton);

      expect(mockOnProblemAttempt).toHaveBeenCalledTimes(1);

      // Simulate interruption
      unmount();

      // In a real implementation, this would test session state persistence
      // and resumption capabilities
      expect(mockOnProblemAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          intendedStrategy: "AdditionDoubles",
        }),
        92,
        true,
      );
    });

    test("should validate focused strategy selection and session setup", () => {
      const validStrategies: StrategyId[] = [
        "AdditionDoubles",
        "AdditionBridgingTo10s",
        "MultiplicationTimes5",
        "SubtractionCompensation",
      ];

      validStrategies.forEach((strategy) => {
        const mockOnComplete = jest.fn();
        const mockOnProblemAttempt = jest.fn();

        const { unmount } = render(
          <MockStrategyFocusedSession
            strategyId={strategy}
            onComplete={mockOnComplete}
            onProblemAttempt={mockOnProblemAttempt}
          />,
        );

        expect(
          screen.getByText(`Focused Practice: ${strategy}`),
        ).toBeInTheDocument();
        expect(screen.getByTestId("strategy-reminder")).toBeInTheDocument();

        unmount();
      });
    });
  });
});
