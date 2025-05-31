import { Problem, User } from "./types";

type Operation = "addition" | "subtraction" | "multiplication" | "division";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Strategy categories for different types of problems
export const STRATEGY_CATEGORIES = {
  // Addition strategies
  "bridging-to-tens": "Problems that cross decade boundaries (88 + 99)",
  doubles: "Problems with numbers close to each other (47 + 48)",
  "breaking-apart": "Problems benefiting from decomposition (67 + 28)",
  "left-to-right": "Standard mental addition (45 + 37)",

  // Subtraction strategies
  "bridging-down": "Subtracting across decades (83 - 47)",
  "adding-up": "Finding difference by adding up (62 - 38)",
  compensation: "Rounding and adjusting (74 - 29)",
  "simple-subtraction": "Basic subtraction (56 - 23)",

  // Multiplication strategies
  doubling: "Powers of 2 multiplication (15 × 4)",
  "breaking-apart-mult": "Distributive property (23 × 7)",
  "near-squares": "Numbers close to squares (19 × 21)",
  "times-5": "Multiplying by 5 (46 × 5)",
  "times-9": "Multiplying by 9 (37 × 9)",
  "times-11": "Multiplying by 11 (24 × 11)",
  "simple-tables": "Basic multiplication tables (6 × 7)",

  // Division strategies
  "factor-recognition": "Recognizing factors (144 ÷ 12)",
  "multiplication-inverse": 'Thinking "what times" (91 ÷ 7)',
  "estimation-adjustment": "Estimate and adjust (156 ÷ 13)",
  "simple-division": "Basic division facts (48 ÷ 6)",
};

// Number ranges for different difficulty levels
const DIFFICULTY_RANGES = {
  beginner: {
    addition: { min: 1, max: 50 },
    subtraction: { min: 1, max: 50 },
    multiplication: { min: 1, max: 10 },
    division: { min: 1, max: 100 },
  },
  intermediate: {
    addition: { min: 10, max: 99 },
    subtraction: { min: 10, max: 99 },
    multiplication: { min: 1, max: 15 },
    division: { min: 1, max: 200 },
  },
  advanced: {
    addition: { min: 50, max: 999 },
    subtraction: { min: 50, max: 999 },
    multiplication: { min: 1, max: 25 },
    division: { min: 1, max: 500 },
  },
};

export class ProblemGenerator {
  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static getRange(operation: Operation, difficulty: DifficultyLevel) {
    return DIFFICULTY_RANGES[difficulty][operation];
  }

  // Addition problem generators
  private static generateAdditionProblem(difficulty: DifficultyLevel): Problem {
    const range = this.getRange("addition", difficulty);
    let operand1: number, operand2: number, strategy: string;

    // Randomly choose a strategy type
    const strategies = [
      "bridging-to-tens",
      "doubles",
      "breaking-apart",
      "left-to-right",
    ];
    const randomStrategy =
      strategies[Math.floor(Math.random() * strategies.length)];

    switch (randomStrategy) {
      case "bridging-to-tens":
        // Create problems that cross decade boundaries
        operand1 = this.getRandomInt(range.min + 8, range.max - 20);
        operand2 = this.getRandomInt(
          Math.max(
            range.min,
            (Math.floor(operand1 / 10) + 1) * 10 - operand1 + 5,
          ),
          Math.min(range.max - operand1, 30),
        );
        strategy = "bridging-to-tens";
        break;

      case "doubles":
        // Create problems with consecutive or nearby numbers
        operand1 = this.getRandomInt(range.min, range.max - 5);
        operand2 = operand1 + this.getRandomInt(1, 3);
        strategy = "doubles";
        break;

      case "breaking-apart":
        // Create problems that benefit from breaking apart
        operand1 = this.getRandomInt(range.min + 10, range.max - 10);
        operand2 = this.getRandomInt(range.min + 15, range.max - operand1);
        strategy = "breaking-apart";
        break;

      default:
        // Standard addition
        operand1 = this.getRandomInt(range.min, range.max);
        operand2 = this.getRandomInt(range.min, range.max - operand1);
        strategy = "left-to-right";
    }

    return {
      id: crypto.randomUUID(),
      operation: "addition",
      operand1,
      operand2,
      correctAnswer: operand1 + operand2,
      timeSpent: 0,
      strategyCategory: strategy,
      attemptedAt: new Date(),
    };
  }

  // Subtraction problem generators
  private static generateSubtractionProblem(
    difficulty: DifficultyLevel,
  ): Problem {
    const range = this.getRange("subtraction", difficulty);
    let operand1: number, operand2: number, strategy: string;

    const strategies = [
      "bridging-down",
      "adding-up",
      "compensation",
      "simple-subtraction",
    ];
    const randomStrategy =
      strategies[Math.floor(Math.random() * strategies.length)];

    switch (randomStrategy) {
      case "bridging-down":
        // Create problems that cross decade boundaries
        operand1 = this.getRandomInt(range.min + 20, range.max);
        operand2 = this.getRandomInt(
          Math.max(range.min, operand1 - Math.floor(operand1 / 10) * 10 + 5),
          Math.min(operand1 - range.min, 25),
        );
        strategy = "bridging-down";
        break;

      case "adding-up":
        // Create problems where adding up is easier
        operand1 = this.getRandomInt(range.min + 15, range.max);
        operand2 = this.getRandomInt(range.min + 8, operand1 - 10);
        strategy = "adding-up";
        break;

      case "compensation":
        // Create problems ending in 8 or 9
        operand1 = this.getRandomInt(range.min + 20, range.max);
        const lastDigit = this.getRandomInt(8, 9);
        operand2 =
          Math.floor(this.getRandomInt(range.min + 5, operand1 - 5) / 10) * 10 +
          lastDigit;
        strategy = "compensation";
        break;

      default:
        // Simple subtraction
        operand1 = this.getRandomInt(range.min + 10, range.max);
        operand2 = this.getRandomInt(range.min, operand1 - range.min);
        strategy = "simple-subtraction";
    }

    return {
      id: crypto.randomUUID(),
      operation: "subtraction",
      operand1,
      operand2,
      correctAnswer: operand1 - operand2,
      timeSpent: 0,
      strategyCategory: strategy,
      attemptedAt: new Date(),
    };
  }

  // Multiplication problem generators
  private static generateMultiplicationProblem(
    difficulty: DifficultyLevel,
  ): Problem {
    const range = this.getRange("multiplication", difficulty);
    let operand1: number, operand2: number, strategy: string;

    const strategies = [
      "doubling",
      "times-5",
      "times-9",
      "times-11",
      "simple-tables",
    ];
    const randomStrategy =
      strategies[Math.floor(Math.random() * strategies.length)];

    switch (randomStrategy) {
      case "doubling":
        // Powers of 2: 2, 4, 8
        operand1 = this.getRandomInt(range.min + 5, Math.min(range.max, 50));
        operand2 = [2, 4, 8][Math.floor(Math.random() * 3)];
        strategy = "doubling";
        break;

      case "times-5":
        operand1 = this.getRandomInt(
          range.min * 2,
          Math.min(range.max * 4, 99),
        );
        operand2 = 5;
        strategy = "times-5";
        break;

      case "times-9":
        operand1 = this.getRandomInt(
          range.min + 2,
          Math.min(range.max + 10, 50),
        );
        operand2 = 9;
        strategy = "times-9";
        break;

      case "times-11":
        if (difficulty !== "beginner") {
          operand1 = this.getRandomInt(12, Math.min(range.max + 20, 99));
          operand2 = 11;
          strategy = "times-11";
        } else {
          // Fall back to simple tables for beginners
          operand1 = this.getRandomInt(range.min, range.max);
          operand2 = this.getRandomInt(range.min, range.max);
          strategy = "simple-tables";
        }
        break;

      default:
        // Simple multiplication tables
        operand1 = this.getRandomInt(range.min, range.max);
        operand2 = this.getRandomInt(range.min, range.max);
        strategy = "simple-tables";
    }

    return {
      id: crypto.randomUUID(),
      operation: "multiplication",
      operand1,
      operand2,
      correctAnswer: operand1 * operand2,
      timeSpent: 0,
      strategyCategory: strategy,
      attemptedAt: new Date(),
    };
  }

  // Division problem generators
  private static generateDivisionProblem(difficulty: DifficultyLevel): Problem {
    const range = this.getRange("division", difficulty);
    let operand1: number, operand2: number, strategy: string;

    const strategies = [
      "factor-recognition",
      "multiplication-inverse",
      "simple-division",
    ];
    const randomStrategy =
      strategies[Math.floor(Math.random() * strategies.length)];

    // For division, we work backwards to ensure clean answers
    let quotient: number;

    switch (randomStrategy) {
      case "factor-recognition":
        // Create problems with recognizable factors
        operand2 = this.getRandomInt(6, Math.min(range.max / 10, 15));
        quotient = this.getRandomInt(6, Math.min(range.max / operand2, 20));
        operand1 = operand2 * quotient;
        strategy = "factor-recognition";
        break;

      case "multiplication-inverse":
        // Standard division that relates to multiplication facts
        operand2 = this.getRandomInt(
          range.min + 2,
          Math.min(range.max / 5, 12),
        );
        quotient = this.getRandomInt(
          range.min + 3,
          Math.min(range.max / operand2, 15),
        );
        operand1 = operand2 * quotient;
        strategy = "multiplication-inverse";
        break;

      default:
        // Simple division
        operand2 = this.getRandomInt(
          range.min + 1,
          Math.min(range.max / 3, 10),
        );
        quotient = this.getRandomInt(
          range.min + 1,
          Math.min(range.max / operand2, 12),
        );
        operand1 = operand2 * quotient;
        strategy = "simple-division";
    }

    return {
      id: crypto.randomUUID(),
      operation: "division",
      operand1,
      operand2,
      correctAnswer: operand1 / operand2,
      timeSpent: 0,
      strategyCategory: strategy,
      attemptedAt: new Date(),
    };
  }

  // Main problem generation function
  static generateProblem(
    operation: Operation,
    difficulty: DifficultyLevel = "beginner",
  ): Problem {
    switch (operation) {
      case "addition":
        return this.generateAdditionProblem(difficulty);
      case "subtraction":
        return this.generateSubtractionProblem(difficulty);
      case "multiplication":
        return this.generateMultiplicationProblem(difficulty);
      case "division":
        return this.generateDivisionProblem(difficulty);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  // Generate a set of problems for a session
  static generateSession(user: User, sessionLength: number = 10): Problem[] {
    const { preferences } = user;
    const enabledOperations: Operation[] = [];

    // Collect enabled operations
    if (preferences.enabledOperations.addition)
      enabledOperations.push("addition");
    if (preferences.enabledOperations.subtraction)
      enabledOperations.push("subtraction");
    if (preferences.enabledOperations.multiplication)
      enabledOperations.push("multiplication");
    if (preferences.enabledOperations.division)
      enabledOperations.push("division");

    if (enabledOperations.length === 0) {
      throw new Error("At least one operation must be enabled");
    }

    const problems: Problem[] = [];

    for (let i = 0; i < sessionLength; i++) {
      // Randomly select an enabled operation
      const randomOperation =
        enabledOperations[Math.floor(Math.random() * enabledOperations.length)];

      const problem = this.generateProblem(
        randomOperation,
        preferences.difficultyLevel,
      );
      problems.push(problem);
    }

    return problems;
  }

  // Get strategy explanation for teaching
  static getStrategyExplanation(problem: Problem): {
    title: string;
    description: string;
    steps: string[];
    example: string;
  } {
    const { operation, operand1, operand2, strategyCategory } = problem;

    switch (strategyCategory) {
      case "bridging-to-tens":
        return {
          title: "Bridging to Tens",
          description:
            "Make one number a round ten to simplify the calculation",
          steps: [
            `Look at ${operand1} + ${operand2}`,
            `Round ${operand2} to ${Math.ceil(operand2 / 10) * 10}`,
            `Calculate ${operand1} + ${Math.ceil(operand2 / 10) * 10} = ${operand1 + Math.ceil(operand2 / 10) * 10}`,
            `Subtract the extra: ${operand1 + Math.ceil(operand2 / 10) * 10} - ${Math.ceil(operand2 / 10) * 10 - operand2} = ${operand1 + operand2}`,
          ],
          example: `${operand1} + ${operand2} = ${operand1 + operand2}`,
        };

      case "times-9":
        return {
          title: "Multiplying by 9",
          description: 'Use the "times 10 minus the number" trick',
          steps: [
            `${operand1} × 9`,
            `Think: ${operand1} × 10 = ${operand1 * 10}`,
            `Then subtract: ${operand1 * 10} - ${operand1} = ${operand1 * 9}`,
          ],
          example: `${operand1} × 9 = ${operand1 * 9}`,
        };

      case "compensation":
        return {
          title: "Compensation Method",
          description: "Round to a friendly number, then adjust",
          steps: [
            `${operand1} - ${operand2}`,
            `Round ${operand2} to ${Math.ceil(operand2 / 10) * 10}`,
            `Calculate ${operand1} - ${Math.ceil(operand2 / 10) * 10} = ${operand1 - Math.ceil(operand2 / 10) * 10}`,
            `Add back: ${operand1 - Math.ceil(operand2 / 10) * 10} + ${Math.ceil(operand2 / 10) * 10 - operand2} = ${operand1 - operand2}`,
          ],
          example: `${operand1} - ${operand2} = ${operand1 - operand2}`,
        };

      default:
        return {
          title: "Standard Method",
          description: "Use the standard algorithm for this type of problem",
          steps: [
            `Calculate ${operand1} ${operation === "addition" ? "+" : operation === "subtraction" ? "-" : operation === "multiplication" ? "×" : "÷"} ${operand2}`,
            `Result: ${problem.correctAnswer}`,
          ],
          example: `${operand1} ${operation === "addition" ? "+" : operation === "subtraction" ? "-" : operation === "multiplication" ? "×" : "÷"} ${operand2} = ${problem.correctAnswer}`,
        };
    }
  }
}
