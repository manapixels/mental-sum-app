// User Management Types
export interface User {
  id: string;
  name: string;
  createdAt: Date;
  avatar?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  enabledOperations: {
    addition: boolean;
    subtraction: boolean;
    multiplication: boolean;
    division: boolean;
  };
  sessionLength: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  timeLimit: number; // seconds per problem
  showStrategies: boolean; // show strategy hints during sessions
  enableSound: boolean; // enable audio feedback
  enableHaptics?: boolean;
  numberRanges: {
    addition: { min: number; max: number };
    subtraction: { min: number; max: number };
    multiplication: { min: number; max: number };
    division: { min: number; max: number };
  };
}

export interface UserStatistics {
  totalProblems: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalSessions: number;
  averageTimePerProblem: number;
  operationStats: {
    addition: OperationStats;
    subtraction: OperationStats;
    multiplication: OperationStats;
    division: OperationStats;
  };
  lastSessionDate?: Date;
  bestStreak: number;
  currentStreak: number;
  strategyPerformance: Record<StrategyId, StrategyMetrics>;
  problemHistory: Problem[];
}

export interface OperationStats {
  attempted: number;
  correct: number;
  averageTime: number;
  fastestTime: number;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  problems: Problem[];
  completed: boolean;
  totalCorrect: number;
  totalWrong: number;
  averageTime: number;
  sessionLength: number;
}

export interface Problem {
  id: string;
  type: "addition" | "subtraction" | "multiplication" | "division";
  operands: [number, number];
  correctAnswer: number;
  intendedStrategy: StrategyId;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeToSolve?: number;
  strategyUsed?: string;
  category?: string;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent: number;
  attemptedAt: Date;
  completedAt?: Date;
}

// Mental Math Strategy Types
export interface MathStrategy {
  id: string;
  name: string;
  operation: "addition" | "subtraction" | "multiplication" | "division";
  description: string;
  example: string;
  steps: string[];
  applicableConditions: (problem: Problem) => boolean;
}

// Storage Schema Types
export interface AppData {
  users: User[];
  currentUserId?: string;
  sessions: Session[];
  version: string;
  lastBackup?: Date;
}

// Strategy Performance Types
export interface StrategyMetrics {
  correct: number;
  incorrect: number;
  totalAttempts: number;
}

export type StrategyId =
  | "AdditionBridgingTo10s"
  | "AdditionDoubles"
  | "AdditionBreakingApart"
  | "AdditionLeftToRight"
  | "SubtractionBridgingDown"
  | "SubtractionAddingUp"
  | "SubtractionCompensation"
  | "MultiplicationDoubling"
  | "MultiplicationBreakingApart"
  | "MultiplicationNearSquares"
  | "MultiplicationTimes5"
  | "MultiplicationTimes9"
  | "DivisionFactorRecognition"
  | "DivisionMultiplicationInverse"
  | "DivisionEstimationAdjustment";

export const ALL_STRATEGY_IDS: StrategyId[] = [
  "AdditionBridgingTo10s",
  "AdditionDoubles",
  "AdditionBreakingApart",
  "AdditionLeftToRight",
  "SubtractionBridgingDown",
  "SubtractionAddingUp",
  "SubtractionCompensation",
  "MultiplicationDoubling",
  "MultiplicationBreakingApart",
  "MultiplicationNearSquares",
  "MultiplicationTimes5",
  "MultiplicationTimes9",
  "DivisionFactorRecognition",
  "DivisionMultiplicationInverse",
  "DivisionEstimationAdjustment",
];

export function initializeStrategyPerformance(): Record<
  StrategyId,
  StrategyMetrics
> {
  const performance = {} as Record<StrategyId, StrategyMetrics>;
  for (const strategyId of ALL_STRATEGY_IDS) {
    performance[strategyId] = {
      correct: 0,
      incorrect: 0,
      totalAttempts: 0,
    };
  }
  return performance;
}

// Default Values
export const defaultUserPreferences: UserPreferences = {
  enabledOperations: {
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true,
  },
  sessionLength: 10,
  difficultyLevel: "beginner",
  timeLimit: 30,
  showStrategies: true,
  enableSound: true,
  enableHaptics: true,
  numberRanges: {
    addition: { min: 1, max: 99 },
    subtraction: { min: 1, max: 99 },
    multiplication: { min: 1, max: 12 },
    division: { min: 1, max: 144 },
  },
};

export const defaultUserStatistics: UserStatistics = {
  totalProblems: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  totalSessions: 0,
  averageTimePerProblem: 0,
  operationStats: {
    addition: { attempted: 0, correct: 0, averageTime: 0, fastestTime: 0 },
    subtraction: { attempted: 0, correct: 0, averageTime: 0, fastestTime: 0 },
    multiplication: {
      attempted: 0,
      correct: 0,
      averageTime: 0,
      fastestTime: 0,
    },
    division: { attempted: 0, correct: 0, averageTime: 0, fastestTime: 0 },
  },
  bestStreak: 0,
  currentStreak: 0,
  strategyPerformance: initializeStrategyPerformance(),
  problemHistory: [],
};
