import {
  UserPreferences,
  UserStatistics,
  Problem,
  StrategyId,
  ALL_STRATEGY_IDS,
} from "./types";
import { PERFORMANCE_THRESHOLDS } from "./performance-thresholds";

// Configuration for adaptive learning - now using centralized thresholds
const ATTEMPT_THRESHOLD =
  PERFORMANCE_THRESHOLDS.ADAPTIVE_WEIGHTS.ATTEMPT_THRESHOLD;
const UNTRIED_STRATEGY_BASE_WEIGHT =
  PERFORMANCE_THRESHOLDS.ADAPTIVE_WEIGHTS.UNTRIED_STRATEGY;
const LOW_ATTEMPT_BOOST_FACTOR =
  PERFORMANCE_THRESHOLDS.ADAPTIVE_WEIGHTS.LOW_ATTEMPT_BOOST_FACTOR;
const MIN_TRIED_STRATEGY_WEIGHT =
  PERFORMANCE_THRESHOLDS.ADAPTIVE_WEIGHTS.MIN_TRIED_STRATEGY;
const MASTERED_STRATEGY_WEIGHT =
  PERFORMANCE_THRESHOLDS.ADAPTIVE_WEIGHTS.MASTERED_STRATEGY;

interface WeightedStrategy {
  strategyId: StrategyId;
  weight: number;
}

function getCandidateStrategies(preferences: UserPreferences): StrategyId[] {
  const candidates: StrategyId[] = [];
  const opMap: Record<keyof UserPreferences["enabledOperations"], string> = {
    addition: "Addition",
    subtraction: "Subtraction",
    multiplication: "Multiplication",
    division: "Division",
  };

  for (const opKey in preferences.enabledOperations) {
    const op = opKey as keyof UserPreferences["enabledOperations"];
    if (preferences.enabledOperations[op]) {
      const prefix = opMap[op];
      ALL_STRATEGY_IDS.forEach((id) => {
        if (id.startsWith(prefix)) {
          candidates.push(id);
        }
      });
    }
  }
  return candidates;
}

function calculateWeaknessWeights(
  candidateStrategies: StrategyId[],
  strategyPerformance: UserStatistics["strategyPerformance"],
): WeightedStrategy[] {
  const weightedStrategies: WeightedStrategy[] = [];

  for (const strategyId of candidateStrategies) {
    const metrics = strategyPerformance[strategyId];
    let weight = 0;

    if (!metrics || metrics.totalAttempts === 0) {
      weight = UNTRIED_STRATEGY_BASE_WEIGHT;
    } else {
      const accuracy = metrics.correct / metrics.totalAttempts;

      // Use centralized mastery criteria
      if (
        accuracy >= PERFORMANCE_THRESHOLDS.MASTERY.ACCURACY &&
        metrics.totalAttempts >= PERFORMANCE_THRESHOLDS.MASTERY.MIN_ATTEMPTS
      ) {
        // Mastered strategy - give it a very low weight to keep it in occasional rotation
        weight = MASTERED_STRATEGY_WEIGHT;
      } else {
        weight = 1.0 - accuracy;

        if (metrics.totalAttempts < ATTEMPT_THRESHOLD) {
          weight +=
            LOW_ATTEMPT_BOOST_FACTOR *
            (ATTEMPT_THRESHOLD - metrics.totalAttempts);
        }
        // Ensure a minimum floor weight for strategies that have been tried but not mastered
        weight = Math.max(weight, MIN_TRIED_STRATEGY_WEIGHT);
      }
    }

    weight = Math.max(0, weight); // Ensure weight is not negative

    if (weight > 0) {
      weightedStrategies.push({ strategyId, weight });
    }
  }
  return weightedStrategies;
}

function selectWeightedRandomStrategy(
  weightedStrategies: WeightedStrategy[],
): StrategyId | null {
  if (weightedStrategies.length === 0) return null;

  const totalWeight = weightedStrategies.reduce(
    (sum, ws) => sum + ws.weight,
    0,
  );
  if (totalWeight === 0) {
    return weightedStrategies[
      Math.floor(Math.random() * weightedStrategies.length)
    ].strategyId;
  }

  let randomVal = Math.random() * totalWeight;
  for (const ws of weightedStrategies) {
    if (randomVal < ws.weight) {
      return ws.strategyId;
    }
    randomVal -= ws.weight;
  }
  return weightedStrategies[weightedStrategies.length - 1].strategyId;
}

function generateProblemForStrategy(
  strategyId: StrategyId,
  difficulty: Problem["difficulty"],
  numberRanges: UserPreferences["numberRanges"],
): Problem | null {
  let operands: [number, number] = [0, 0];
  let correctAnswer: number = 0;
  let type: Problem["type"] = "addition"; // Default

  // Determine operation type from strategyId for selecting number range
  let operationForRange: keyof UserPreferences["numberRanges"] = "addition";
  if (strategyId.toLowerCase().startsWith("subtraction"))
    operationForRange = "subtraction";
  else if (strategyId.toLowerCase().startsWith("multiplication"))
    operationForRange = "multiplication";
  else if (strategyId.toLowerCase().startsWith("division"))
    operationForRange = "division";

  const range = numberRanges[operationForRange];

  // Simplified difficulty mapping (expand this per strategy)
  const getNum = (
    opRange: { min: number; max: number },
    forDifficulty: Problem["difficulty"],
  ) => {
    let min = opRange.min;
    let max = opRange.max;
    if (forDifficulty === "intermediate") {
      min = Math.floor(min + (max - min) / 3);
      max = Math.floor(max - (max - min) / 3);
    } else if (forDifficulty === "advanced") {
      min = Math.floor(min + (2 * (max - min)) / 3);
      // max remains opRange.max for advanced, or could be tighter
    }
    return getRandomInt(min, Math.max(min, max)); // ensure min <= max
  };

  // --- Complete Problem Generation Logic for All Strategies ---
  switch (strategyId) {
    // === ADDITION STRATEGIES ===
    case "AdditionBridgingTo10s":
      type = "addition";
      let num1Bridging = getNum(range, difficulty);
      // Ensure num1Bridging is like X7,X8,X9 or X1,X2,X3
      const proximityTo10 = getRandomInt(1, 3);
      if (Math.random() < 0.5)
        num1Bridging =
          Math.floor(num1Bridging / 10) * 10 + (10 - proximityTo10);
      // X7,X8,X9
      else num1Bridging = Math.floor(num1Bridging / 10) * 10 + proximityTo10; // X1,X2,X3
      operands = [num1Bridging, getNum(range, difficulty)];
      correctAnswer = operands[0] + operands[1];
      break;

    case "AdditionDoubles":
      type = "addition";
      const baseDouble = getNum(range, difficulty);
      operands = [baseDouble, baseDouble + getRandomInt(-2, 2)];
      operands[1] = Math.max(range.min, operands[1]); // ensure it's not too small
      if (operands[1] === operands[0]) operands[1]++; // avoid exact doubles
      correctAnswer = operands[0] + operands[1];
      break;

    case "AdditionBreakingApart":
      type = "addition";
      // Generate numbers where one can be easily broken into tens and ones
      const baseNum = getNum(range, difficulty);
      let breakableNum = getRandomInt(12, Math.min(range.max, 89)); // ensure it has tens and ones
      // Make sure tens part is reasonable
      breakableNum = Math.floor(breakableNum / 10) * 10 + getRandomInt(2, 8);
      operands = [baseNum, breakableNum];
      correctAnswer = operands[0] + operands[1];
      break;

    case "AdditionLeftToRight":
      type = "addition";
      // Generate 2-digit numbers that benefit from left-to-right addition
      const num1Left = getRandomInt(
        Math.max(range.min, 12),
        Math.min(range.max, 89),
      );
      const num2Left = getRandomInt(
        Math.max(range.min, 12),
        Math.min(range.max, 89),
      );
      operands = [num1Left, num2Left];
      correctAnswer = operands[0] + operands[1];
      break;

    // === SUBTRACTION STRATEGIES ===
    case "SubtractionBridgingDown":
      type = "subtraction";
      // Create problems where subtracting to next 10 is helpful
      let minuend = getNum(range, difficulty);
      const subtrahendBridge = getRandomInt(2, 9); // amount that goes past a 10
      const tensToSubtract = getRandomInt(1, 3) * 10;
      const totalToSubtract = tensToSubtract + subtrahendBridge;
      // Ensure positive result
      while (minuend - totalToSubtract < 0) {
        minuend = getNum(range, difficulty);
      }
      operands = [minuend, totalToSubtract];
      correctAnswer = operands[0] - operands[1];
      break;

    case "SubtractionAddingUp":
      type = "subtraction";
      // Generate problems where counting up is easier than subtracting down
      const larger = getNum(range, difficulty);
      const smaller =
        larger - getRandomInt(5, Math.min(30, larger - range.min));
      operands = [larger, smaller];
      correctAnswer = operands[0] - operands[1];
      break;

    case "SubtractionCompensation":
      type = "subtraction";
      // Create problems where rounding the subtrahend helps
      let minuendComp = getNum(range, difficulty);
      const roundBase = getRandomInt(1, 5) * 10;
      const subtrahendComp = roundBase + getRandomInt(-3, -1); // like 27, 28, 29
      while (minuendComp - subtrahendComp < 0) {
        minuendComp = getNum(range, difficulty);
      }
      operands = [minuendComp, subtrahendComp];
      correctAnswer = operands[0] - operands[1];
      break;

    // === MULTIPLICATION STRATEGIES ===
    case "MultiplicationDoubling":
      type = "multiplication";
      // Generate problems with factors of 2, 4, 8
      const doublingFactors = [2, 4, 8];
      const doublingFactor =
        doublingFactors[Math.floor(Math.random() * doublingFactors.length)];
      const otherFactor = getNum(range, difficulty);
      operands = [otherFactor, doublingFactor];
      correctAnswer = operands[0] * operands[1];
      break;

    case "MultiplicationBreakingApart":
      type = "multiplication";
      // Generate problems where one number can be broken into tens and ones
      let factorToBreak = getRandomInt(12, Math.min(range.max, 89));
      // Ensure it has meaningful tens and ones parts
      factorToBreak = Math.floor(factorToBreak / 10) * 10 + getRandomInt(2, 9);
      const otherFactorBreak = getRandomInt(Math.max(range.min, 2), 12);
      operands = [factorToBreak, otherFactorBreak];
      correctAnswer = operands[0] * operands[1];
      break;

    case "MultiplicationNearSquares":
      type = "multiplication";
      // Generate problems like 19×21, 18×22 that are near squares
      const baseSquare = getRandomInt(
        Math.max(10, Math.ceil(Math.sqrt(range.min))),
        Math.min(Math.floor(Math.sqrt(range.max)), 25),
      );
      const offset = getRandomInt(1, 3);
      operands = [baseSquare - offset, baseSquare + offset];
      correctAnswer = operands[0] * operands[1];
      break;

    case "MultiplicationTimes5":
      type = "multiplication";
      operands = [getNum(range, difficulty), 5];
      correctAnswer = operands[0] * operands[1];
      break;

    case "MultiplicationTimes9":
      type = "multiplication";
      // Generate problems multiplying by 9
      const factorFor9 = getNum(range, difficulty);
      operands = [factorFor9, 9];
      correctAnswer = operands[0] * operands[1];
      break;

    // === DIVISION STRATEGIES ===
    case "DivisionFactorRecognition":
      type = "division";
      const factor1 = getRandomInt(
        2,
        difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 8 : 12,
      );
      const factor2 = getRandomInt(
        2,
        difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 8 : 10,
      );
      const quotient = getRandomInt(
        2,
        difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 8 : 10,
      );
      operands = [factor1 * factor2 * quotient, factor1 * factor2]; // dividend, divisor
      if (
        operands[0] > range.max ||
        operands[1] > range.max ||
        operands[1] === 0
      ) {
        // basic check, retry or adjust if out of range
        operands = [100, 10]; // fallback if generation is tricky
      }
      correctAnswer = operands[0] / operands[1];
      break;

    case "DivisionMultiplicationInverse":
      type = "division";
      // Create division problems that are easier to think of as "what times X equals Y"
      const divisorInverse = getRandomInt(
        2,
        difficulty === "beginner" ? 9 : difficulty === "intermediate" ? 12 : 15,
      );
      const quotientInverse = getRandomInt(
        2,
        difficulty === "beginner"
          ? 12
          : difficulty === "intermediate"
            ? 20
            : 30,
      );
      operands = [divisorInverse * quotientInverse, divisorInverse];
      correctAnswer = quotientInverse;
      break;

    case "DivisionEstimationAdjustment":
      type = "division";
      // Create problems that benefit from estimation and adjustment
      const divisorEst = getRandomInt(
        6,
        difficulty === "beginner"
          ? 15
          : difficulty === "intermediate"
            ? 25
            : 40,
      );
      const quotientEst = getRandomInt(
        3,
        difficulty === "beginner"
          ? 12
          : difficulty === "intermediate"
            ? 18
            : 25,
      );
      // Add a small remainder to make estimation necessary
      const remainder = getRandomInt(1, divisorEst - 1);
      operands = [divisorEst * quotientEst + remainder, divisorEst];
      correctAnswer = Math.floor(operands[0] / operands[1]); // Integer division
      break;

    default:
      // Fallback for any unexpected strategies
      console.warn(
        `Problem generation not fully implemented for strategy: ${strategyId}. Using fallback.`,
      );
      type = operationForRange;
      let op1 = getNum(range, difficulty);
      let op2 = getNum(range, difficulty);
      if (type === "subtraction") {
        if (op1 < op2) [op1, op2] = [op2, op1]; // Ensure op1 >= op2 for positive result
        operands = [op1, op2];
        correctAnswer = op1 - op2;
      } else if (type === "division") {
        if (op2 === 0) op2 = 1; // Avoid division by zero
        operands = [op1 * op2, op2]; // Ensure whole number result
        correctAnswer = op1; // quotient is op1
      } else if (type === "multiplication") {
        operands = [op1, op2];
        correctAnswer = op1 * op2;
      } else {
        // Addition default
        operands = [op1, op2];
        correctAnswer = op1 + op2;
      }
      break;
  }

  // Ensure operands are within global min/max if necessary, though strategy-specific logic should handle ranges
  // operands[0] = Math.max(1, Math.min(operands[0], 999)); // Example global cap
  // operands[1] = Math.max(1, Math.min(operands[1], type === 'division' ? 99 : 999));

  return {
    id: crypto.randomUUID(),
    type: type,
    operands: operands,
    correctAnswer: correctAnswer,
    intendedStrategy: strategyId,
    difficulty: difficulty,
    timeSpent: 0,
    attemptedAt: new Date(),
  };
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (min > max) [min, max] = [max, min]; // Ensure min <= max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Public API for the Problem Engine ---
export const ProblemEngine = {
  generateProblem: (
    userPreferences: UserPreferences,
    userStatistics: UserStatistics,
    focusedStrategyId?: StrategyId | null, // Optional: For practicing a specific strategy
  ): Problem | null => {
    const difficulty = userPreferences.difficultyLevel;

    if (focusedStrategyId) {
      console.log(
        `ProblemEngine: Generating focused problem for strategy: ${focusedStrategyId}`,
      );
      return generateProblemForStrategy(
        focusedStrategyId,
        difficulty,
        userPreferences.numberRanges,
      );
    }

    const candidateStrategies = getCandidateStrategies(userPreferences);
    if (candidateStrategies.length === 0) {
      console.warn(
        "ProblemEngine: No candidate strategies available based on user preferences.",
      );
      return null; // Or a very generic fallback problem
    }

    const weightedStrategies = calculateWeaknessWeights(
      candidateStrategies,
      userStatistics.strategyPerformance,
    );

    if (weightedStrategies.length === 0) {
      // Fallback: if all strategies have 0 effective weight (e.g. all mastered and no untried)
      // Pick a random candidate strategy
      console.warn(
        "ProblemEngine: All candidate strategies have zero effective weight. Picking random candidate.",
      );
      const randomStrategy =
        candidateStrategies[
          Math.floor(Math.random() * candidateStrategies.length)
        ];
      return generateProblemForStrategy(
        randomStrategy,
        difficulty,
        userPreferences.numberRanges,
      );
    }

    const selectedStrategyId = selectWeightedRandomStrategy(weightedStrategies);
    if (!selectedStrategyId) {
      console.warn(
        "ProblemEngine: Could not select a strategy via weighted random. Picking random candidate.",
      );
      const randomStrategy =
        candidateStrategies[
          Math.floor(Math.random() * candidateStrategies.length)
        ];
      return generateProblemForStrategy(
        randomStrategy,
        difficulty,
        userPreferences.numberRanges,
      );
    }

    return generateProblemForStrategy(
      selectedStrategyId,
      difficulty,
      userPreferences.numberRanges,
    );
  },
};
