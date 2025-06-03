import { MathStrategy, Problem, StrategyId, ALL_STRATEGY_IDS } from "./types";

export const STRATEGIES_DATA: Record<
  StrategyId,
  Omit<MathStrategy, "id" | "applicableConditions">
> = {
  AdditionBridgingTo10s: {
    name: "Bridging to 10s",
    operation: "addition",
    description: "Adjust one number to make a multiple of 10, then compensate.",
    example: "e.g., 88 + 9: Think 88 + 10 = 98, then 98 - 1 = 97.",
    steps: [
      "Round one number to the nearest 10.",
      "Add/subtract the rounded number.",
      "Adjust the result by the amount rounded.",
    ],
  },
  AdditionDoubles: {
    name: "Doubles / Near Doubles",
    operation: "addition",
    description:
      "Use knowledge of doubles for numbers that are close together.",
    example: "e.g., 47 + 48: Think 47 + 47 = 94, then 94 + 1 = 95.",
    steps: [
      "Identify numbers that are doubles or near doubles.",
      "Calculate the double.",
      "Adjust if it's a near double.",
    ],
  },
  AdditionBreakingApart: {
    name: "Breaking Apart (Decomposition)",
    operation: "addition",
    description: "Break down one or both numbers into simpler parts to add.",
    example: "e.g., 67 + 28: Think 67 + 20 = 87, then 87 + 8 = 95.",
    steps: [
      "Break one number into tens and ones (or other friendly parts).",
      "Add one part to the other number.",
      "Add the remaining part.",
    ],
  },
  AdditionLeftToRight: {
    name: "Left-to-Right Addition",
    operation: "addition",
    description:
      "Add numbers from left to right (hundreds, then tens, then ones).",
    example:
      "e.g., 45 + 37: Think 40 + 30 = 70, then 5 + 7 = 12, so 70 + 12 = 82.",
    steps: [
      "Add the highest place values first (e.g., hundreds or tens).",
      "Add the next place values.",
      "Combine the partial sums.",
    ],
  },
  SubtractionBridgingDown: {
    name: "Bridging Down (via 10s)",
    operation: "subtraction",
    description:
      "Subtract in parts, going down to the nearest multiple of 10 first.",
    example: "e.g., 83 - 7: Think 83 - 3 = 80, then 80 - 4 = 76.",
    steps: [
      "Subtract to reach the nearest lower multiple of 10.",
      "Subtract the remaining amount from that multiple of 10.",
    ],
  },
  SubtractionAddingUp: {
    name: "Adding Up (Counting On)",
    operation: "subtraction",
    description:
      "Find the difference by counting up from the smaller number to the larger.",
    example:
      "e.g., 62 - 38: How much to get from 38 to 62? 38 + 2 = 40, 40 + 20 = 60, 60 + 2 = 62. So, 2+20+2 = 24.",
    steps: [
      "Start with the smaller number.",
      "Count up in friendly steps (to the next 10, etc.) until you reach the larger number.",
      "Sum the amounts you counted up.",
    ],
  },
  SubtractionCompensation: {
    name: "Compensation (Subtraction)",
    operation: "subtraction",
    description:
      "Adjust one number to make subtraction easier, then compensate.",
    example: "e.g., 74 - 29: Think 74 - 30 = 44, then 44 + 1 = 45.",
    steps: [
      "Round the number being subtracted (subtrahend) to a friendly number (e.g., nearest 10).",
      "Perform the subtraction.",
      "Adjust the result to compensate for the rounding (add if you rounded up, subtract if you rounded down).",
    ],
  },
  MultiplicationDoubling: {
    name: "Doubling",
    operation: "multiplication",
    description: "Use doubling for multiplications involving 2, 4, 8, etc.",
    example: "e.g., 15 × 4: Think 15 × 2 = 30, then 30 × 2 = 60.",
    steps: [
      "Break down one multiplier into factors of 2.",
      "Repeatedly double the other number.",
    ],
  },
  MultiplicationBreakingApart: {
    name: "Breaking Apart (Distributive)",
    operation: "multiplication",
    description:
      "Break one number into parts, multiply each part, then add results.",
    example: "e.g., 23 × 7: Think (20 × 7) + (3 × 7) = 140 + 21 = 161.",
    steps: [
      "Break one number into convenient parts (e.g., tens and ones).",
      "Multiply each part by the other number.",
      "Add the products.",
    ],
  },
  MultiplicationNearSquares: {
    name: "Near Squares (Difference of Squares)",
    operation: "multiplication",
    description: "Use (a-b)(a+b) = a² - b² for numbers near a square.",
    example:
      "e.g., 19 × 21: Think (20 - 1)(20 + 1) = 20² - 1² = 400 - 1 = 399.",
    steps: [
      "Identify two numbers that are equidistant from a 'middle' number (e.g., 19 and 21 are 1 away from 20).",
      "Square the middle number.",
      "Square the difference.",
      "Subtract the second square from the first.",
    ],
  },
  MultiplicationTimes5: {
    name: "Times 5",
    operation: "multiplication",
    description: "Multiply by 10, then halve the result.",
    example: "e.g., 46 × 5: Think 46 × 10 = 460, then 460 ÷ 2 = 230.",
    steps: [
      "Multiply the number by 10 (add a zero).",
      "Divide the result by 2.",
    ],
  },
  MultiplicationTimes9: {
    name: "Times 9",
    operation: "multiplication",
    description: "Multiply by 10, then subtract the original number.",
    example: "e.g., 37 × 9: Think 37 × 10 = 370, then 370 - 37 = 333.",
    steps: [
      "Multiply the number by 10.",
      "Subtract the original number from this product.",
    ],
  },
  DivisionFactorRecognition: {
    name: "Factor Recognition",
    operation: "division",
    description:
      "Break the divisor or dividend into factors to simplify division.",
    example:
      "e.g., 144 ÷ 12: Think 144 ÷ (2 × 6) → 144 ÷ 2 = 72, then 72 ÷ 6 = 12. Or 144 ÷ (3x4).",
    steps: [
      "Break the divisor (or dividend) into smaller, manageable factors.",
      "Divide by one factor at a time.",
    ],
  },
  DivisionMultiplicationInverse: {
    name: "Multiplication Inverse",
    operation: "division",
    description: "Rephrase division as 'What number multiplied by X equals Y?'",
    example: "e.g., 91 ÷ 7: Think 'What × 7 = 91?' Answer: 13.",
    steps: [
      "Convert the division problem into a missing factor multiplication problem.",
      "Use multiplication facts or estimation to find the missing factor.",
    ],
  },
  DivisionEstimationAdjustment: {
    name: "Estimation & Adjustment",
    operation: "division",
    description: "Estimate the quotient, then adjust based on multiplication.",
    example:
      "e.g., 156 ÷ 13: Estimate 10 (13 × 10 = 130). Remainder 26. 13 × 2 = 26. So 10 + 2 = 12.",
    steps: [
      "Make an initial estimate for the quotient.",
      "Multiply your estimate by the divisor.",
      "Compare with the dividend and adjust your estimate up or down.",
      "Repeat if necessary.",
    ],
  },
};

export const MAPPED_STRATEGIES: MathStrategy[] = ALL_STRATEGY_IDS.map((id) => ({
  id,
  ...STRATEGIES_DATA[id],
  applicableConditions: (problem: Problem) => {
    // Placeholder: The problem generator should ensure intendedStrategy is applicable.
    // This could be expanded later for more dynamic strategy validation if needed.
    return problem.intendedStrategy === id;
  },
}));

export const getStrategyDetailsById = (
  strategyId?: StrategyId,
): MathStrategy | undefined => {
  if (!strategyId) return undefined;
  return MAPPED_STRATEGIES.find((s) => s.id === strategyId);
};

// For simpler hints, you might want a specific hint string per strategy
// This can be similar to the original getStrategyHint but drawing from the detailed data
export const getConciseStrategyHint = (problem: Problem): string => {
  const strategy = getStrategyDetailsById(problem.intendedStrategy);
  if (!strategy) {
    return "Try to break down the problem into simpler steps.";
  }

  // Prioritize specific, dynamic hints for some strategies if possible
  // Fallback to general description or name
  switch (problem.intendedStrategy) {
    case "AdditionBridgingTo10s":
      return `Try making one number a round 10. e.g., ${problem.operands[0]} + ${problem.operands[1]}. Adjust ${problem.operands[1]} to ${Math.round(problem.operands[1] / 10) * 10}?`;
    case "AdditionDoubles":
      return `Is this a double or near double? Like ${problem.operands[0]} + ${problem.operands[0]}?`;
    case "MultiplicationTimes9":
      return `For × 9: multiply by 10 (${problem.operands[0]} × 10 = ${problem.operands[0] * 10}), then subtract the number (${problem.operands[0] * 10} - ${problem.operands[0]} = ${problem.operands[0] * 9}).`;
    case "MultiplicationTimes5":
      return `For × 5: multiply by 10 (${problem.operands[0]} × 10 = ${problem.operands[0] * 10}), then divide by 2.`;
    // Add more specific hints for other common strategies
    default:
      return (
        strategy.description ||
        strategy.name ||
        "Consider the recommended strategy."
      );
  }
};
