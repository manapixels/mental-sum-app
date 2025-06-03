import {
  UserPreferences,
  UserStatistics,
  Problem,
  StrategyId,
  ALL_STRATEGY_IDS,
} from "./types";

// Configuration for adaptive learning
const ATTEMPT_THRESHOLD = 5;
const UNTRIED_STRATEGY_BASE_WEIGHT = 1.0;
const LOW_ATTEMPT_BOOST_FACTOR = 0.2;
const MIN_TRIED_STRATEGY_WEIGHT = 0.05;
const MASTERED_STRATEGY_WEIGHT = 0.01; // New: for strategies considered mastered

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

      if (accuracy === 1 && metrics.totalAttempts >= ATTEMPT_THRESHOLD) {
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
  console.log(
    `ProblemEngine: Generating problem for strategy: ${strategyId}, difficulty: ${difficulty}`,
  );

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

  // --- Placeholder Problem Generation Logic (to be expanded) ---
  switch (strategyId) {
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
      operands = [baseDouble, baseDouble + getRandomInt(1, 2)];
      if (Math.random() < 0.5 && operands[1] > range.min + 1)
        operands[1] -= getRandomInt(1, 2) * 2; // sometimes make it N, N-1 or N, N-2
      operands[1] = Math.max(range.min, operands[1]); // ensure it's not too small
      correctAnswer = operands[0] + operands[1];
      break;
    // TODO: Add cases for ALL other Addition strategies

    case "MultiplicationTimes5":
      type = "multiplication";
      operands = [getNum(range, difficulty), 5];
      correctAnswer = operands[0] * operands[1];
      break;
    // TODO: Add cases for ALL other Multiplication strategies

    case "DivisionFactorRecognition": // Example for Division
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

    default:
      // Fallback for strategies not yet implemented - generate a generic problem of the operation type
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
