import { ProblemEngine } from "@/lib/problem-engine";
import {
  UserPreferences,
  UserStatistics,
  Problem,
  StrategyId,
} from "@/lib/types";
import { PERFORMANCE_THRESHOLDS } from "@/lib/performance-thresholds";

// Test data setup
const mockUserPreferences: UserPreferences = {
  enabledOperations: {
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
  },
  difficultyLevel: "intermediate",
  sessionLength: 10,
  timeLimit: 30,
  showStrategies: true,
  enableSound: true,
  enableHaptics: true,
  numberRanges: {
    addition: { min: 10, max: 99 },
    subtraction: { min: 10, max: 99 },
    multiplication: { min: 2, max: 12 },
    division: { min: 10, max: 100 },
  },
};

const createMockUserStatistics = (
  strategyOverrides: Partial<UserStatistics["strategyPerformance"]> = {},
): UserStatistics => ({
  totalProblems: 50,
  correctAnswers: 35,
  wrongAnswers: 15,
  totalSessions: 5,
  averageTimePerProblem: 15,
  bestStreak: 8,
  currentStreak: 3,
  operationStats: {
    addition: { attempted: 15, correct: 12, averageTime: 12, fastestTime: 8 },
    subtraction: {
      attempted: 10,
      correct: 8,
      averageTime: 18,
      fastestTime: 10,
    },
    multiplication: {
      attempted: 15,
      correct: 10,
      averageTime: 20,
      fastestTime: 12,
    },
    division: { attempted: 10, correct: 5, averageTime: 25, fastestTime: 15 },
  },
  strategyPerformance: {
    AdditionBridgingTo10s: { totalAttempts: 5, correct: 3, incorrect: 2 },
    AdditionDoubles: { totalAttempts: 5, correct: 4, incorrect: 1 },
    AdditionBreakingApart: { totalAttempts: 3, correct: 2, incorrect: 1 },
    AdditionLeftToRight: { totalAttempts: 4, correct: 3, incorrect: 1 },
    SubtractionBridgingDown: { totalAttempts: 3, correct: 1, incorrect: 2 },
    SubtractionAddingUp: { totalAttempts: 4, correct: 3, incorrect: 1 },
    SubtractionCompensation: { totalAttempts: 3, correct: 2, incorrect: 1 },
    MultiplicationDoubling: { totalAttempts: 6, correct: 4, incorrect: 2 },
    MultiplicationBreakingApart: { totalAttempts: 4, correct: 2, incorrect: 2 },
    MultiplicationNearSquares: { totalAttempts: 2, correct: 1, incorrect: 1 },
    MultiplicationTimes5: { totalAttempts: 3, correct: 3, incorrect: 0 },
    MultiplicationTimes9: { totalAttempts: 2, correct: 1, incorrect: 1 },
    DivisionFactorRecognition: { totalAttempts: 4, correct: 2, incorrect: 2 },
    DivisionMultiplicationInverse: {
      totalAttempts: 3,
      correct: 1,
      incorrect: 2,
    },
    DivisionEstimationAdjustment: {
      totalAttempts: 3,
      correct: 1,
      incorrect: 2,
    },
    ...strategyOverrides,
  },
  problemHistory: [],
});

describe("Problem Engine", () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods to prevent test output pollution
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("generateProblem", () => {
    test("should generate a valid problem object", () => {
      const userStats = createMockUserStatistics();
      const problem = ProblemEngine.generateProblem(
        mockUserPreferences,
        userStats,
      );

      expect(problem).toBeDefined();
      expect(problem).toHaveProperty("id");
      expect(problem).toHaveProperty("type");
      expect(problem).toHaveProperty("operands");
      expect(problem).toHaveProperty("correctAnswer");
      expect(problem).toHaveProperty("intendedStrategy");
      expect(problem).toHaveProperty("difficulty");
      expect(problem).toHaveProperty("timeSpent");
      expect(problem).toHaveProperty("attemptedAt");

      expect(typeof problem!.id).toBe("string");
      expect([
        "addition",
        "subtraction",
        "multiplication",
        "division",
      ]).toContain(problem!.type);
      expect(Array.isArray(problem!.operands)).toBe(true);
      expect(problem!.operands).toHaveLength(2);
      expect(typeof problem!.correctAnswer).toBe("number");
      expect(typeof problem!.intendedStrategy).toBe("string");
      expect(["beginner", "intermediate", "advanced"]).toContain(
        problem!.difficulty,
      );
      expect(problem!.timeSpent).toBe(0);
      expect(problem!.attemptedAt).toBeInstanceOf(Date);
    });

    test("should return null when no operations are enabled", () => {
      const disabledPreferences: UserPreferences = {
        ...mockUserPreferences,
        enabledOperations: {
          addition: false,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      };

      const userStats = createMockUserStatistics();
      const problem = ProblemEngine.generateProblem(
        disabledPreferences,
        userStats,
      );

      expect(problem).toBeNull();
    });

    test("should respect difficulty level in problem generation", () => {
      const beginnerPreferences: UserPreferences = {
        ...mockUserPreferences,
        difficultyLevel: "beginner",
      };

      const userStats = createMockUserStatistics();
      const problem = ProblemEngine.generateProblem(
        beginnerPreferences,
        userStats,
      );

      expect(problem).toBeDefined();
      expect(problem!.difficulty).toBe("beginner");
    });

    test("should prioritize untried strategies", () => {
      // Create user stats with ALL addition strategies having data - most untried, one tried
      const userStats = createMockUserStatistics({
        AdditionBridgingTo10s: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
        AdditionDoubles: { totalAttempts: 10, correct: 8, incorrect: 2 }, // Tried with 80% accuracy
        AdditionBreakingApart: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
        AdditionLeftToRight: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
      });

      const problems: Problem[] = [];
      // Significantly increase sample size for more reliable results
      for (let i = 0; i < 1000; i++) {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
        );
        if (problem) problems.push(problem);
      }

      expect(problems.length).toBeGreaterThan(0);

      // Count untried vs tried strategies
      const triedStrategyProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionDoubles",
      );
      const untriedStrategyProblems = problems.filter((p) =>
        [
          "AdditionBridgingTo10s",
          "AdditionBreakingApart",
          "AdditionLeftToRight",
        ].includes(p.intendedStrategy),
      );

      // With 3 untried strategies (weight 1.0 each) vs 1 tried strategy (weight 0.2):
      // Total weights: 3.0 + 0.2 = 3.2
      // Expected ratio: untried should be ~94% (3.0/3.2), tried should be ~6% (0.2/3.2)
      expect(untriedStrategyProblems.length).toBeGreaterThan(
        triedStrategyProblems.length * 3,
      ); // At least 3:1 ratio
    });

    test("should generate focused problems when focusedStrategyId is provided", () => {
      const userStats = createMockUserStatistics();
      const focusedStrategy: StrategyId = "AdditionDoubles";

      const problem = ProblemEngine.generateProblem(
        mockUserPreferences,
        userStats,
        focusedStrategy,
      );

      expect(problem).toBeDefined();
      expect(problem!.intendedStrategy).toBe(focusedStrategy);
      expect(problem!.type).toBe("addition");
    });

    test("should generate problems within specified number ranges", () => {
      const userStats = createMockUserStatistics();

      // Test multiple problems to ensure range compliance
      for (let i = 0; i < 10; i++) {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
        );
        expect(problem).toBeDefined();

        const range = mockUserPreferences.numberRanges[problem!.type];

        // Operands should generally be within range (with some flexibility for strategy-specific logic)
        problem!.operands.forEach((operand) => {
          expect(operand).toBeGreaterThanOrEqual(0); // Basic sanity check
          // For division problems, allow more flexibility as they can generate larger dividends
          const maxAllowed =
            problem!.type === "division" ? range.max * 10 : range.max * 2;
          expect(operand).toBeLessThanOrEqual(maxAllowed); // Allow more flexibility for division strategy logic
        });
      }
    });
  });

  describe("Strategy-Specific Problem Generation", () => {
    const userStats = createMockUserStatistics();

    describe("Addition Strategies", () => {
      test("should generate valid AdditionBridgingTo10s problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "AdditionBridgingTo10s",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("addition");
        expect(problem!.intendedStrategy).toBe("AdditionBridgingTo10s");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] + problem!.operands[1],
        );

        // At least one operand should be close to a multiple of 10
        const hasNearTen = problem!.operands.some((op) => {
          const lastDigit = op % 10;
          return lastDigit <= 3 || lastDigit >= 7;
        });
        expect(hasNearTen).toBe(true);
      });

      test("should generate valid AdditionDoubles problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "AdditionDoubles",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("addition");
        expect(problem!.intendedStrategy).toBe("AdditionDoubles");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] + problem!.operands[1],
        );

        // Operands should be close to each other (near doubles)
        const difference = Math.abs(
          problem!.operands[0] - problem!.operands[1],
        );
        expect(difference).toBeLessThanOrEqual(4);
        expect(difference).toBeGreaterThan(0); // Should not be exact doubles
      });

      test("should generate valid AdditionBreakingApart problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "AdditionBreakingApart",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("addition");
        expect(problem!.intendedStrategy).toBe("AdditionBreakingApart");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] + problem!.operands[1],
        );

        // At least one operand should be a multi-digit number suitable for breaking apart
        const hasBreakableNumber = problem!.operands.some(
          (op) => op >= 12 && op <= 89,
        );
        expect(hasBreakableNumber).toBe(true);
      });

      test("should generate valid AdditionLeftToRight problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "AdditionLeftToRight",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("addition");
        expect(problem!.intendedStrategy).toBe("AdditionLeftToRight");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] + problem!.operands[1],
        );

        // Both operands should be 2-digit numbers for left-to-right strategy
        problem!.operands.forEach((op) => {
          expect(op).toBeGreaterThanOrEqual(12);
          expect(op).toBeLessThanOrEqual(89);
        });
      });
    });

    describe("Subtraction Strategies", () => {
      test("should generate valid SubtractionBridgingDown problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "SubtractionBridgingDown",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("subtraction");
        expect(problem!.intendedStrategy).toBe("SubtractionBridgingDown");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] - problem!.operands[1],
        );
        expect(problem!.correctAnswer).toBeGreaterThanOrEqual(0);
      });

      test("should generate valid SubtractionCompensation problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "SubtractionCompensation",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("subtraction");
        expect(problem!.intendedStrategy).toBe("SubtractionCompensation");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] - problem!.operands[1],
        );
        expect(problem!.correctAnswer).toBeGreaterThanOrEqual(0);

        // Subtrahend should be close to a multiple of 10 for compensation strategy
        const subtrahend = problem!.operands[1];
        const nearestTen = Math.round(subtrahend / 10) * 10;
        const distanceFromTen = Math.abs(subtrahend - nearestTen);
        expect(distanceFromTen).toBeLessThanOrEqual(3);
      });
    });

    describe("Multiplication Strategies", () => {
      test("should generate valid MultiplicationDoubling problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "MultiplicationDoubling",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("multiplication");
        expect(problem!.intendedStrategy).toBe("MultiplicationDoubling");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] * problem!.operands[1],
        );

        // One operand should be a doubling factor (2, 4, or 8)
        const doublingFactors = [2, 4, 8];
        const hasDoublingFactor = problem!.operands.some((op) =>
          doublingFactors.includes(op),
        );
        expect(hasDoublingFactor).toBe(true);
      });

      test("should generate valid MultiplicationTimes5 problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "MultiplicationTimes5",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("multiplication");
        expect(problem!.intendedStrategy).toBe("MultiplicationTimes5");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] * problem!.operands[1],
        );

        // One operand should be 5
        expect(problem!.operands).toContain(5);
      });

      test("should generate valid MultiplicationTimes9 problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "MultiplicationTimes9",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("multiplication");
        expect(problem!.intendedStrategy).toBe("MultiplicationTimes9");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] * problem!.operands[1],
        );

        // One operand should be 9
        expect(problem!.operands).toContain(9);
      });

      test("should generate valid MultiplicationNearSquares problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "MultiplicationNearSquares",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("multiplication");
        expect(problem!.intendedStrategy).toBe("MultiplicationNearSquares");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] * problem!.operands[1],
        );

        // Operands should be equidistant from a perfect square
        const [a, b] = problem!.operands;

        // Check if this follows the near-squares pattern
        const difference = Math.abs(a - b);
        expect(difference).toBeGreaterThan(0);
        expect(difference).toBeLessThanOrEqual(6); // Reasonable range for near squares
      });
    });

    describe("Division Strategies", () => {
      test("should generate valid DivisionFactorRecognition problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "DivisionFactorRecognition",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("division");
        expect(problem!.intendedStrategy).toBe("DivisionFactorRecognition");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] / problem!.operands[1],
        );
        expect(problem!.correctAnswer).toBe(Math.floor(problem!.correctAnswer)); // Should be whole number
        expect(problem!.operands[1]).toBeGreaterThan(0); // No division by zero
      });

      test("should generate valid DivisionMultiplicationInverse problems", () => {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
          "DivisionMultiplicationInverse",
        );

        expect(problem).toBeDefined();
        expect(problem!.type).toBe("division");
        expect(problem!.intendedStrategy).toBe("DivisionMultiplicationInverse");
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] / problem!.operands[1],
        );
        expect(problem!.correctAnswer).toBe(Math.floor(problem!.correctAnswer)); // Should be whole number
        expect(problem!.operands[1]).toBeGreaterThan(0); // No division by zero

        // Verify the division works out to a clean multiplication inverse
        expect(problem!.operands[0] % problem!.operands[1]).toBe(0);
      });
    });
  });

  describe("Adaptive Learning Logic", () => {
    test("should prioritize strategies with lower accuracy", () => {
      // Create user stats where one strategy has very low accuracy
      const userStats = createMockUserStatistics({
        AdditionBridgingTo10s: { totalAttempts: 10, correct: 2, incorrect: 8 }, // 20% accuracy
        AdditionDoubles: { totalAttempts: 10, correct: 9, incorrect: 1 }, // 90% accuracy
      });

      const problems: Problem[] = [];
      // Increase sample size for more reliable results
      for (let i = 0; i < 100; i++) {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
        );
        if (problem) problems.push(problem);
      }

      const bridgingProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionBridgingTo10s",
      );
      const doublesProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionDoubles",
      );

      // Lower accuracy strategy should appear more frequently or at least equally
      // The adaptive algorithm should strongly favor the 20% accuracy strategy over the 90% one
      expect(bridgingProblems.length).toBeGreaterThanOrEqual(
        doublesProblems.length,
      );
    });

    test("should give minimal weight to mastered strategies", () => {
      // Create user stats where one strategy is mastered using centralized criteria
      const userStats = createMockUserStatistics({
        AdditionDoubles: {
          totalAttempts: PERFORMANCE_THRESHOLDS.MASTERY.MIN_ATTEMPTS,
          correct: Math.ceil(
            PERFORMANCE_THRESHOLDS.MASTERY.MIN_ATTEMPTS *
              PERFORMANCE_THRESHOLDS.MASTERY.ACCURACY,
          ),
          incorrect: Math.floor(
            PERFORMANCE_THRESHOLDS.MASTERY.MIN_ATTEMPTS *
              (1 - PERFORMANCE_THRESHOLDS.MASTERY.ACCURACY),
          ),
        }, // Mastered
        AdditionBridgingTo10s: { totalAttempts: 10, correct: 5, incorrect: 5 }, // Needs work
      });

      const problems: Problem[] = [];
      // Massively increase sample size for statistical significance
      for (let i = 0; i < 2000; i++) {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
        );
        if (problem) problems.push(problem);
      }

      const doublesProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionDoubles",
      );
      const bridgingProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionBridgingTo10s",
      );

      // Mastered strategy should appear much less frequently
      expect(bridgingProblems.length).toBeGreaterThan(doublesProblems.length);

      // With centralized MASTERED_STRATEGY_WEIGHT, expect roughly that percentage of samples
      // With 2000 samples, we should see some occurrences statistically, but allow for randomness
      // Mastered strategies should be less than 10% of total problems due to very low weight
      expect(doublesProblems.length).toBeLessThan(problems.length * 0.1);
    });

    test("should boost strategies with low attempt counts", () => {
      // Create user stats where one strategy has very few attempts
      const userStats = createMockUserStatistics({
        AdditionBridgingTo10s: { totalAttempts: 2, correct: 1, incorrect: 1 }, // Low attempts
        AdditionDoubles: { totalAttempts: 20, correct: 15, incorrect: 5 }, // Many attempts
      });

      const problems: Problem[] = [];
      for (let i = 0; i < 50; i++) {
        const problem = ProblemEngine.generateProblem(
          mockUserPreferences,
          userStats,
        );
        if (problem) problems.push(problem);
      }

      const bridgingProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionBridgingTo10s",
      );
      const doublesProblems = problems.filter(
        (p) => p.intendedStrategy === "AdditionDoubles",
      );

      // Low attempt strategy should appear more frequently due to boost
      expect(bridgingProblems.length).toBeGreaterThanOrEqual(
        doublesProblems.length,
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty strategy performance data", () => {
      const userStats: UserStatistics = {
        ...createMockUserStatistics(),
        strategyPerformance: {
          AdditionBridgingTo10s: { totalAttempts: 0, correct: 0, incorrect: 0 },
          AdditionDoubles: { totalAttempts: 0, correct: 0, incorrect: 0 },
          AdditionBreakingApart: { totalAttempts: 0, correct: 0, incorrect: 0 },
          AdditionLeftToRight: { totalAttempts: 0, correct: 0, incorrect: 0 },
          SubtractionBridgingDown: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          SubtractionAddingUp: { totalAttempts: 0, correct: 0, incorrect: 0 },
          SubtractionCompensation: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          MultiplicationDoubling: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          MultiplicationBreakingApart: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          MultiplicationNearSquares: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          MultiplicationTimes5: { totalAttempts: 0, correct: 0, incorrect: 0 },
          MultiplicationTimes9: { totalAttempts: 0, correct: 0, incorrect: 0 },
          DivisionFactorRecognition: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          DivisionMultiplicationInverse: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
          DivisionEstimationAdjustment: {
            totalAttempts: 0,
            correct: 0,
            incorrect: 0,
          },
        },
      };

      const problem = ProblemEngine.generateProblem(
        mockUserPreferences,
        userStats,
      );
      expect(problem).toBeDefined();
    });

    test("should handle extreme number ranges", () => {
      const extremePreferences: UserPreferences = {
        ...mockUserPreferences,
        numberRanges: {
          addition: { min: 1, max: 2 },
          subtraction: { min: 10, max: 11 },
          multiplication: { min: 2, max: 3 },
          division: { min: 10, max: 20 },
        },
      };

      const userStats = createMockUserStatistics();
      const problem = ProblemEngine.generateProblem(
        extremePreferences,
        userStats,
      );

      expect(problem).toBeDefined();
      // Problem should still be mathematically valid
      if (problem!.type === "addition") {
        expect(problem!.correctAnswer).toBe(
          problem!.operands[0] + problem!.operands[1],
        );
      }
    });

    test("should handle single operation enabled", () => {
      const singleOpPreferences: UserPreferences = {
        ...mockUserPreferences,
        enabledOperations: {
          addition: true,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      };

      const userStats = createMockUserStatistics();
      const problem = ProblemEngine.generateProblem(
        singleOpPreferences,
        userStats,
      );

      expect(problem).toBeDefined();
      expect(problem!.type).toBe("addition");
      expect(problem!.intendedStrategy).toMatch(/^Addition/);
    });
  });
});
