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
  operation: "addition" | "subtraction" | "multiplication" | "division";
  operand1: number;
  operand2: number;
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent: number;
  strategyCategory?: string;
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
};
