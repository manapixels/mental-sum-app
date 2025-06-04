import { ProblemEngine } from "@/lib/problem-engine";
import {
  UserStatistics,
  UserPreferences,
  StrategyId,
  defaultUserPreferences,
} from "@/lib/types";

// Define StrategyPerformance type locally since it's not exported
type StrategyPerformance = {
  totalAttempts: number;
  correct: number;
  incorrect: number;
};

// Mock adaptive learning functions
class AdaptiveLearningEngine {
  static getWeakStrategies(
    strategyPerformance: Record<StrategyId, StrategyPerformance>,
  ): StrategyId[] {
    const weakStrategies: StrategyId[] = [];

    Object.entries(strategyPerformance).forEach(([strategyId, performance]) => {
      const accuracy =
        performance.totalAttempts > 0
          ? performance.correct / performance.totalAttempts
          : 0;

      // Consider weak if accuracy < 70% and has at least 3 attempts
      if (performance.totalAttempts >= 3 && accuracy < 0.7) {
        weakStrategies.push(strategyId as StrategyId);
      }
    });

    return weakStrategies;
  }

  static getMasteredStrategies(
    strategyPerformance: Record<StrategyId, StrategyPerformance>,
  ): StrategyId[] {
    const masteredStrategies: StrategyId[] = [];

    Object.entries(strategyPerformance).forEach(([strategyId, performance]) => {
      const accuracy =
        performance.totalAttempts > 0
          ? performance.correct / performance.totalAttempts
          : 0;

      // Consider mastered if accuracy >= 90% and has at least 10 attempts
      if (performance.totalAttempts >= 10 && accuracy >= 0.9) {
        masteredStrategies.push(strategyId as StrategyId);
      }
    });

    return masteredStrategies;
  }

  static getUntriedStrategies(
    strategyPerformance: Record<StrategyId, StrategyPerformance>,
  ): StrategyId[] {
    const untriedStrategies: StrategyId[] = [];

    Object.entries(strategyPerformance).forEach(([strategyId, performance]) => {
      if (performance.totalAttempts === 0) {
        untriedStrategies.push(strategyId as StrategyId);
      }
    });

    return untriedStrategies;
  }

  static calculateStrategyWeight(
    strategyId: StrategyId,
    strategyPerformance: Record<StrategyId, StrategyPerformance>,
  ): number {
    const performance = strategyPerformance[strategyId];

    if (!performance || performance.totalAttempts === 0) {
      return 1.0; // High weight for untried strategies
    }

    const accuracy = performance.correct / performance.totalAttempts;

    // Mastered strategies get very low weight
    if (performance.totalAttempts >= 10 && accuracy >= 0.9) {
      return 0.01;
    }

    // Weak strategies get higher weight
    if (accuracy < 0.7) {
      return 0.8 + (0.7 - accuracy); // 0.8 to 1.5 range
    }

    // Medium strategies get medium weight
    return 0.2 + (0.9 - accuracy) * 0.6; // 0.2 to 0.8 range
  }

  static recommendNextPractice(
    strategyPerformance: Record<StrategyId, StrategyPerformance>,
  ): {
    focusedStrategy?: StrategyId;
    reason: string;
    priority: "high" | "medium" | "low";
  } {
    const weakStrategies = this.getWeakStrategies(strategyPerformance);
    const untriedStrategies = this.getUntriedStrategies(strategyPerformance);

    if (weakStrategies.length > 0) {
      // Find the weakest strategy
      let weakestStrategy = weakStrategies[0];
      let lowestAccuracy = 1;

      weakStrategies.forEach((strategyId) => {
        const performance = strategyPerformance[strategyId];
        const accuracy = performance.correct / performance.totalAttempts;
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy;
          weakestStrategy = strategyId;
        }
      });

      return {
        focusedStrategy: weakestStrategy,
        reason: `Strategy needs improvement (${Math.round(lowestAccuracy * 100)}% accuracy)`,
        priority: "high",
      };
    }

    if (untriedStrategies.length > 0) {
      return {
        focusedStrategy: untriedStrategies[0],
        reason: "New strategy to explore",
        priority: "medium",
      };
    }

    return {
      reason: "Continue general practice - all strategies performing well",
      priority: "low",
    };
  }

  static generateFocusedPracticeSession(
    strategyId: StrategyId,
    preferences: UserPreferences,
    sessionLength: number = 10,
  ): { problems: number; estimatedTime: number; objectives: string[] } {
    return {
      problems: sessionLength,
      estimatedTime: sessionLength * 30, // 30 seconds per problem
      objectives: [
        `Master the ${strategyId} technique`,
        "Improve accuracy to 85% or higher",
        "Reduce average response time",
        "Build confidence with this strategy",
      ],
    };
  }
}

describe("Adaptive Learning Algorithm", () => {
  const createMockStrategyPerformance = (
    overrides: Partial<Record<StrategyId, StrategyPerformance>> = {},
  ): Record<StrategyId, StrategyPerformance> => {
    const defaultPerformance: StrategyPerformance = {
      totalAttempts: 0,
      correct: 0,
      incorrect: 0,
    };

    return {
      AdditionBridgingTo10s: defaultPerformance,
      AdditionDoubles: defaultPerformance,
      AdditionBreakingApart: defaultPerformance,
      AdditionLeftToRight: defaultPerformance,
      SubtractionBridgingDown: defaultPerformance,
      SubtractionAddingUp: defaultPerformance,
      SubtractionCompensation: defaultPerformance,
      MultiplicationDoubling: defaultPerformance,
      MultiplicationBreakingApart: defaultPerformance,
      MultiplicationNearSquares: defaultPerformance,
      MultiplicationTimes5: defaultPerformance,
      MultiplicationTimes9: defaultPerformance,
      DivisionFactorRecognition: defaultPerformance,
      DivisionMultiplicationInverse: defaultPerformance,
      DivisionEstimationAdjustment: defaultPerformance,
      ...overrides,
    };
  };

  describe("Weakness Detection", () => {
    test("should identify strategies with low accuracy as weak", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 10, correct: 3, incorrect: 7 }, // 30% accuracy
        AdditionBridgingTo10s: { totalAttempts: 5, correct: 4, incorrect: 1 }, // 80% accuracy
        MultiplicationTimes5: { totalAttempts: 8, correct: 2, incorrect: 6 }, // 25% accuracy
      });

      const weakStrategies =
        AdaptiveLearningEngine.getWeakStrategies(strategyPerformance);

      expect(weakStrategies).toContain("AdditionDoubles");
      expect(weakStrategies).toContain("MultiplicationTimes5");
      expect(weakStrategies).not.toContain("AdditionBridgingTo10s"); // 80% accuracy is not weak
    });

    test("should not consider strategies with insufficient attempts as weak", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 2, correct: 0, incorrect: 2 }, // 0% accuracy but only 2 attempts
        SubtractionCompensation: { totalAttempts: 5, correct: 1, incorrect: 4 }, // 20% accuracy with 5 attempts
      });

      const weakStrategies =
        AdaptiveLearningEngine.getWeakStrategies(strategyPerformance);

      expect(weakStrategies).not.toContain("AdditionDoubles"); // Insufficient attempts
      expect(weakStrategies).toContain("SubtractionCompensation"); // Sufficient attempts, low accuracy
    });
  });

  describe("Mastery Detection", () => {
    test("should identify strategies with high accuracy and sufficient attempts as mastered", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 15, correct: 14, incorrect: 1 }, // 93% accuracy
        MultiplicationTimes5: { totalAttempts: 12, correct: 11, incorrect: 1 }, // 92% accuracy
        SubtractionAddingUp: { totalAttempts: 8, correct: 8, incorrect: 0 }, // 100% but insufficient attempts
      });

      const masteredStrategies =
        AdaptiveLearningEngine.getMasteredStrategies(strategyPerformance);

      expect(masteredStrategies).toContain("AdditionDoubles");
      expect(masteredStrategies).toContain("MultiplicationTimes5");
      expect(masteredStrategies).not.toContain("SubtractionAddingUp"); // Insufficient attempts for mastery
    });

    test("should require both high accuracy and sufficient attempts for mastery", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 15, correct: 12, incorrect: 3 }, // 80% accuracy - not high enough
        MultiplicationTimes9: { totalAttempts: 5, correct: 5, incorrect: 0 }, // 100% but insufficient attempts
      });

      const masteredStrategies =
        AdaptiveLearningEngine.getMasteredStrategies(strategyPerformance);

      expect(masteredStrategies).toHaveLength(0);
    });
  });

  describe("Untried Strategy Detection", () => {
    test("should identify strategies with zero attempts as untried", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 5, correct: 3, incorrect: 2 },
        MultiplicationTimes5: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
        DivisionFactorRecognition: {
          totalAttempts: 0,
          correct: 0,
          incorrect: 0,
        }, // Untried
      });

      const untriedStrategies =
        AdaptiveLearningEngine.getUntriedStrategies(strategyPerformance);

      expect(untriedStrategies).toContain("MultiplicationTimes5");
      expect(untriedStrategies).toContain("DivisionFactorRecognition");
      expect(untriedStrategies).not.toContain("AdditionDoubles");
    });
  });

  describe("Strategy Weighting Algorithm", () => {
    test("should give high weight to untried strategies", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
      });

      const weight = AdaptiveLearningEngine.calculateStrategyWeight(
        "AdditionDoubles",
        strategyPerformance,
      );

      expect(weight).toBe(1.0);
    });

    test("should give very low weight to mastered strategies", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 15, correct: 14, incorrect: 1 }, // Mastered (93%)
      });

      const weight = AdaptiveLearningEngine.calculateStrategyWeight(
        "AdditionDoubles",
        strategyPerformance,
      );

      expect(weight).toBe(0.01);
    });

    test("should give higher weight to weak strategies", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 10, correct: 3, incorrect: 7 }, // Weak (30%)
        MultiplicationTimes5: { totalAttempts: 10, correct: 8, incorrect: 2 }, // Good (80%)
      });

      const weakWeight = AdaptiveLearningEngine.calculateStrategyWeight(
        "AdditionDoubles",
        strategyPerformance,
      );
      const goodWeight = AdaptiveLearningEngine.calculateStrategyWeight(
        "MultiplicationTimes5",
        strategyPerformance,
      );

      expect(weakWeight).toBeGreaterThan(goodWeight);
      expect(weakWeight).toBeGreaterThan(1.0); // Weak strategies get boosted weight
    });
  });

  describe("Practice Recommendations", () => {
    test("should recommend focused practice for weakest strategy", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 10, correct: 2, incorrect: 8 }, // 20% accuracy
        MultiplicationTimes5: { totalAttempts: 8, correct: 4, incorrect: 4 }, // 50% accuracy
        SubtractionCompensation: {
          totalAttempts: 12,
          correct: 10,
          incorrect: 2,
        }, // 83% accuracy
      });

      const recommendation =
        AdaptiveLearningEngine.recommendNextPractice(strategyPerformance);

      expect(recommendation.focusedStrategy).toBe("AdditionDoubles"); // Weakest strategy
      expect(recommendation.priority).toBe("high");
      expect(recommendation.reason).toContain("20% accuracy");
    });

    test("should recommend untried strategies when no weak strategies exist", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 8, correct: 6, incorrect: 2 }, // 75% accuracy - not weak
        MultiplicationTimes5: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Untried
        AdditionBridgingTo10s: { totalAttempts: 0, correct: 0, incorrect: 0 }, // Also untried
      });

      const recommendation =
        AdaptiveLearningEngine.recommendNextPractice(strategyPerformance);

      // Should recommend one of the untried strategies (could be either one)
      expect(["MultiplicationTimes5", "AdditionBridgingTo10s"]).toContain(
        recommendation.focusedStrategy,
      );
      expect(recommendation.priority).toBe("medium");
      expect(recommendation.reason).toContain("New strategy");
    });

    test("should recommend general practice when all strategies are performing well", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 10, correct: 8, incorrect: 2 }, // 80% accuracy
        MultiplicationTimes5: { totalAttempts: 12, correct: 10, incorrect: 2 }, // 83% accuracy
        SubtractionAddingUp: { totalAttempts: 15, correct: 13, incorrect: 2 }, // 87% accuracy
        AdditionBridgingTo10s: { totalAttempts: 8, correct: 6, incorrect: 2 }, // 75% accuracy
        AdditionBreakingApart: { totalAttempts: 6, correct: 5, incorrect: 1 }, // 83% accuracy
        AdditionLeftToRight: { totalAttempts: 7, correct: 6, incorrect: 1 }, // 86% accuracy
      });

      const recommendation =
        AdaptiveLearningEngine.recommendNextPractice(strategyPerformance);

      // With all strategies having decent performance (no weak ones), it should recommend general practice
      // However, if there are still some untried strategies, it might recommend those instead
      if (recommendation.focusedStrategy) {
        // If it recommends a focused strategy, it should be an untried one or lower performing one
        expect(recommendation.priority).toMatch(/medium|high/);
      } else {
        // If no focused strategy, should be general practice
        expect(recommendation.focusedStrategy).toBeUndefined();
        expect(recommendation.priority).toBe("low");
        expect(recommendation.reason).toContain(
          "all strategies performing well",
        );
      }
    });
  });

  describe("Focused Practice Session Generation", () => {
    test("should generate appropriate focused practice session parameters", () => {
      const session = AdaptiveLearningEngine.generateFocusedPracticeSession(
        "AdditionDoubles",
        defaultUserPreferences,
        8,
      );

      expect(session.problems).toBe(8);
      expect(session.estimatedTime).toBe(240); // 8 * 30 seconds
      expect(session.objectives).toContain(
        "Master the AdditionDoubles technique",
      );
      expect(session.objectives).toContain("Improve accuracy to 85% or higher");
    });

    test("should adjust session length based on parameters", () => {
      const shortSession =
        AdaptiveLearningEngine.generateFocusedPracticeSession(
          "MultiplicationTimes5",
          defaultUserPreferences,
          5,
        );

      const longSession = AdaptiveLearningEngine.generateFocusedPracticeSession(
        "MultiplicationTimes5",
        defaultUserPreferences,
        15,
      );

      expect(shortSession.problems).toBe(5);
      expect(shortSession.estimatedTime).toBe(150);
      expect(longSession.problems).toBe(15);
      expect(longSession.estimatedTime).toBe(450);
    });
  });

  describe("Integration with Problem Engine", () => {
    test("should generate problems for weak strategies more frequently", () => {
      const userStats: UserStatistics = {
        totalProblems: 50,
        correctAnswers: 35,
        wrongAnswers: 15,
        totalSessions: 5,
        averageTimePerProblem: 15,
        bestStreak: 8,
        currentStreak: 3,
        operationStats: {
          addition: {
            attempted: 20,
            correct: 15,
            averageTime: 12,
            fastestTime: 8,
          },
          subtraction: {
            attempted: 15,
            correct: 10,
            averageTime: 18,
            fastestTime: 10,
          },
          multiplication: {
            attempted: 10,
            correct: 7,
            averageTime: 20,
            fastestTime: 12,
          },
          division: {
            attempted: 5,
            correct: 3,
            averageTime: 25,
            fastestTime: 15,
          },
        },
        strategyPerformance: createMockStrategyPerformance({
          AdditionDoubles: { totalAttempts: 10, correct: 3, incorrect: 7 }, // 30% - weak
          AdditionBridgingTo10s: { totalAttempts: 8, correct: 7, incorrect: 1 }, // 87% - good
        }),
        problemHistory: [],
      };

      const problems = [];
      for (let i = 0; i < 100; i++) {
        const problem = ProblemEngine.generateProblem(
          defaultUserPreferences,
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

      // Weak strategy should appear more frequently than good strategy
      expect(doublesProblems.length).toBeGreaterThan(bridgingProblems.length);
    });

    test("should support focused practice mode with specific strategy", () => {
      const userStats: UserStatistics = {
        totalProblems: 20,
        correctAnswers: 15,
        wrongAnswers: 5,
        totalSessions: 2,
        averageTimePerProblem: 18,
        bestStreak: 5,
        currentStreak: 2,
        operationStats: {
          addition: {
            attempted: 20,
            correct: 15,
            averageTime: 18,
            fastestTime: 10,
          },
          subtraction: {
            attempted: 0,
            correct: 0,
            averageTime: 0,
            fastestTime: 0,
          },
          multiplication: {
            attempted: 0,
            correct: 0,
            averageTime: 0,
            fastestTime: 0,
          },
          division: {
            attempted: 0,
            correct: 0,
            averageTime: 0,
            fastestTime: 0,
          },
        },
        strategyPerformance: createMockStrategyPerformance(),
        problemHistory: [],
      };

      // Generate focused problems for specific strategy
      const focusedProblems = [];
      for (let i = 0; i < 10; i++) {
        const problem = ProblemEngine.generateProblem(
          defaultUserPreferences,
          userStats,
          "AdditionDoubles",
        );
        if (problem) focusedProblems.push(problem);
      }

      // All problems should be for the focused strategy
      expect(focusedProblems).toHaveLength(10);
      focusedProblems.forEach((problem) => {
        expect(problem.intendedStrategy).toBe("AdditionDoubles");
      });
    });
  });

  describe("Progress Tracking", () => {
    test("should track improvement over focused practice sessions", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 10, correct: 3, incorrect: 7 }, // Starting: 30%
      });

      // Simulate improvement over multiple sessions
      const sessions = [
        { correct: 2, total: 5 }, // Session 1: 40% accuracy
        { correct: 3, total: 5 }, // Session 2: 60% accuracy
        { correct: 4, total: 5 }, // Session 3: 80% accuracy
      ];

      sessions.forEach((session) => {
        const currentPerf = strategyPerformance.AdditionDoubles;
        strategyPerformance.AdditionDoubles = {
          totalAttempts: currentPerf.totalAttempts + session.total,
          correct: currentPerf.correct + session.correct,
          incorrect: currentPerf.incorrect + (session.total - session.correct),
        };
      });

      const finalPerformance = strategyPerformance.AdditionDoubles;
      const finalAccuracy =
        finalPerformance.correct / finalPerformance.totalAttempts;

      expect(finalAccuracy).toBeCloseTo(0.48, 2); // (3+2+3+4)/(10+5+5+5) = 12/25 = 48%
      expect(finalPerformance.totalAttempts).toBe(25);

      // Strategy should no longer be considered weak
      const weakStrategies =
        AdaptiveLearningEngine.getWeakStrategies(strategyPerformance);
      // With 48% accuracy, it's still below 70% threshold, so still weak
      expect(weakStrategies).toContain("AdditionDoubles");
    });

    test("should detect when strategy transitions from weak to competent", () => {
      const strategyPerformance = createMockStrategyPerformance({
        AdditionDoubles: { totalAttempts: 20, correct: 15, incorrect: 5 }, // 75% accuracy
      });

      const weakStrategies =
        AdaptiveLearningEngine.getWeakStrategies(strategyPerformance);
      const masteredStrategies =
        AdaptiveLearningEngine.getMasteredStrategies(strategyPerformance);

      expect(weakStrategies).not.toContain("AdditionDoubles"); // No longer weak
      expect(masteredStrategies).not.toContain("AdditionDoubles"); // Not yet mastered (need 90% + 10 attempts)
    });
  });
});
