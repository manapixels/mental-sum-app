import React from "react";
import { StrategyId } from "@/lib/types";
import { STRATEGY_DISPLAY_DETAILS } from "@/components/user/user-strategy-progress-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StrategyHelpModalProps {
  strategyId: StrategyId | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StrategyContent {
  description: string;
  method: string[];
  examples: Array<{
    problem: string;
    solution: string;
    explanation: string;
  }>;
  tips: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const STRATEGY_CONTENT: Record<StrategyId, StrategyContent> = {
  AdditionBridgingTo10s: {
    description:
      "Break down addition by first reaching the nearest 10, then adding the remaining amount. This makes mental calculation much easier.",
    method: [
      "Identify how much you need to add to reach the next 10",
      "Add that amount to make 10, 20, 30, etc.",
      "Add the remaining amount to get your final answer",
    ],
    examples: [
      {
        problem: "27 + 8",
        solution: "35",
        explanation:
          "27 + 3 = 30 (bridging to 30), then 30 + 5 = 35 (remaining 8-3=5)",
      },
      {
        problem: "46 + 17",
        solution: "63",
        explanation:
          "46 + 4 = 50 (bridging to 50), then 50 + 13 = 63 (remaining 17-4=13)",
      },
      {
        problem: "38 + 25",
        solution: "63",
        explanation:
          "38 + 2 = 40 (bridging to 40), then 40 + 23 = 63 (remaining 25-2=23)",
      },
    ],
    tips: [
      "Always identify the nearest 10 first",
      "Practice recognizing gaps to 10 quickly",
      "Works especially well when crossing tens boundaries",
    ],
    difficulty: "Beginner",
  },

  AdditionDoubles: {
    description:
      "Use known doubles (like 7+7=14) to solve near-doubles problems by adding or subtracting 1 or 2.",
    method: [
      "Identify if the numbers are the same or close to the same",
      "Find the double of the smaller number",
      "Add the difference to get your answer",
    ],
    examples: [
      {
        problem: "7 + 8",
        solution: "15",
        explanation: "7 + 7 = 14 (double), then 14 + 1 = 15 (since 8 is 7+1)",
      },
      {
        problem: "9 + 8",
        solution: "17",
        explanation: "8 + 8 = 16 (double), then 16 + 1 = 17 (since 9 is 8+1)",
      },
      {
        problem: "6 + 7",
        solution: "13",
        explanation: "6 + 6 = 12 (double), then 12 + 1 = 13 (since 7 is 6+1)",
      },
    ],
    tips: [
      "Memorize doubles up to 10+10",
      "Look for numbers that differ by only 1 or 2",
      "This strategy is very fast once you know your doubles",
    ],
    difficulty: "Beginner",
  },

  AdditionBreakingApart: {
    description:
      "Break one or both numbers into easier parts (usually tens and ones) to make addition simpler.",
    method: [
      "Break down one or both numbers into tens and ones",
      "Add the tens together, then the ones together",
      "Combine the results for your final answer",
    ],
    examples: [
      {
        problem: "34 + 28",
        solution: "62",
        explanation:
          "30 + 20 = 50 (tens), 4 + 8 = 12 (ones), then 50 + 12 = 62",
      },
      {
        problem: "47 + 35",
        solution: "82",
        explanation:
          "40 + 30 = 70 (tens), 7 + 5 = 12 (ones), then 70 + 12 = 82",
      },
      {
        problem: "29 + 16",
        solution: "45",
        explanation:
          "20 + 10 = 30 (tens), 9 + 6 = 15 (ones), then 30 + 15 = 45",
      },
    ],
    tips: [
      "Always separate tens and ones clearly",
      "Add tens first, they're usually easier",
      "Don't forget to combine your partial sums",
    ],
    difficulty: "Beginner",
  },

  AdditionLeftToRight: {
    description:
      "Add from left to right (tens first, then ones), which follows natural number reading and is often faster than traditional right-to-left.",
    method: [
      "Start with the leftmost (largest) digits",
      "Add the tens, then add the ones",
      "Adjust if there's any carrying needed",
    ],
    examples: [
      {
        problem: "42 + 35",
        solution: "77",
        explanation:
          "40 + 30 = 70 (tens place), then 2 + 5 = 7 (ones place), so 70 + 7 = 77",
      },
      {
        problem: "67 + 28",
        solution: "95",
        explanation:
          "60 + 20 = 80 (tens place), then 7 + 8 = 15 (ones place), so 80 + 15 = 95",
      },
      {
        problem: "53 + 24",
        solution: "77",
        explanation:
          "50 + 20 = 70 (tens place), then 3 + 4 = 7 (ones place), so 70 + 7 = 77",
      },
    ],
    tips: [
      "This follows how we naturally read numbers",
      "Helps you get a quick estimate of the answer size",
      "Particularly useful for larger numbers",
    ],
    difficulty: "Beginner",
  },

  SubtractionBridgingDown: {
    description:
      "Subtract by first going down to the nearest 10, then subtracting the remaining amount.",
    method: [
      "Identify how much to subtract to reach the previous 10",
      "Subtract that amount to reach 10, 20, 30, etc.",
      "Subtract the remaining amount to get your final answer",
    ],
    examples: [
      {
        problem: "32 - 15",
        solution: "17",
        explanation:
          "32 - 2 = 30 (bridge to 30), then 30 - 13 = 17 (remaining 15-2=13)",
      },
      {
        problem: "54 - 18",
        solution: "36",
        explanation:
          "54 - 4 = 50 (bridge to 50), then 50 - 14 = 36 (remaining 18-4=14)",
      },
      {
        problem: "73 - 26",
        solution: "47",
        explanation:
          "73 - 3 = 70 (bridge to 70), then 70 - 23 = 47 (remaining 26-3=23)",
      },
    ],
    tips: [
      "Identify the nearest lower 10 first",
      "Practice gaps from multiples of 10",
      "Works well when crossing tens boundaries",
    ],
    difficulty: "Intermediate",
  },

  SubtractionAddingUp: {
    description:
      "Find the difference by adding up from the smaller number to the larger number, counting the steps.",
    method: [
      "Start from the number being subtracted",
      "Add up to reach the starting number",
      "Count how much you added - that's your answer",
    ],
    examples: [
      {
        problem: "63 - 27",
        solution: "36",
        explanation:
          "27 + 3 = 30, 30 + 30 = 60, 60 + 3 = 63. Total added: 3 + 30 + 3 = 36",
      },
      {
        problem: "82 - 45",
        solution: "37",
        explanation:
          "45 + 5 = 50, 50 + 30 = 80, 80 + 2 = 82. Total added: 5 + 30 + 2 = 37",
      },
      {
        problem: "71 - 29",
        solution: "42",
        explanation:
          "29 + 1 = 30, 30 + 40 = 70, 70 + 1 = 71. Total added: 1 + 40 + 1 = 42",
      },
    ],
    tips: [
      "Think of it as 'how much to add' instead of subtract",
      "Use friendly numbers like 10, 20, 30 as stepping stones",
      "This method often feels more natural than traditional subtraction",
    ],
    difficulty: "Intermediate",
  },

  SubtractionCompensation: {
    description:
      "Adjust both numbers to make subtraction easier, then compensate for the change.",
    method: [
      "Round one number to a friendly number (usually ending in 0)",
      "Adjust the other number by the same amount",
      "Perform the easier subtraction",
    ],
    examples: [
      {
        problem: "64 - 29",
        solution: "35",
        explanation:
          "Change to 64 - 30 = 34 (easier), then add back 1: 34 + 1 = 35",
      },
      {
        problem: "83 - 37",
        solution: "46",
        explanation:
          "Change to 83 - 40 = 43 (easier), then add back 3: 43 + 3 = 46",
      },
      {
        problem: "72 - 28",
        solution: "44",
        explanation:
          "Change to 72 - 30 = 42 (easier), then add back 2: 42 + 2 = 44",
      },
    ],
    tips: [
      "Always round to numbers ending in 0 when possible",
      "Remember to compensate in the opposite direction",
      "This makes mental math much cleaner",
    ],
    difficulty: "Intermediate",
  },

  MultiplicationDoubling: {
    description:
      "Use the relationship between doubling and halving to make multiplication easier, especially when one number is even.",
    method: [
      "If one number is even, halve it and double the other",
      "Continue until you reach an easy multiplication",
      "Multiply the final numbers",
    ],
    examples: [
      {
        problem: "18 × 5",
        solution: "90",
        explanation: "18 × 5 = 9 × 10 = 90 (halved 18, doubled 5)",
      },
      {
        problem: "24 × 15",
        solution: "360",
        explanation:
          "24 × 15 = 12 × 30 = 6 × 60 = 360 (kept halving and doubling)",
      },
      {
        problem: "16 × 7",
        solution: "112",
        explanation: "16 × 7 = 8 × 14 = 4 × 28 = 112 (halving 16, doubling 7)",
      },
    ],
    tips: [
      "Look for even numbers to halve",
      "Doubling is often easier than other multiplication",
      "You can apply this technique multiple times",
    ],
    difficulty: "Intermediate",
  },

  MultiplicationBreakingApart: {
    description:
      "Break numbers into easier parts (like tens and ones) and use the distributive property.",
    method: [
      "Break one number into tens and ones",
      "Multiply each part separately",
      "Add the products together",
    ],
    examples: [
      {
        problem: "23 × 4",
        solution: "92",
        explanation: "23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92",
      },
      {
        problem: "17 × 6",
        solution: "102",
        explanation: "17 × 6 = (10 × 6) + (7 × 6) = 60 + 42 = 102",
      },
      {
        problem: "35 × 3",
        solution: "105",
        explanation: "35 × 3 = (30 × 3) + (5 × 3) = 90 + 15 = 105",
      },
    ],
    tips: [
      "Break into tens and ones for easiest calculation",
      "Multiply by 10s first (just add a zero)",
      "Make sure to add both products at the end",
    ],
    difficulty: "Beginner",
  },

  MultiplicationNearSquares: {
    description:
      "Use perfect squares to calculate multiplication of numbers close to square numbers.",
    method: [
      "Identify the nearest perfect square",
      "Calculate how far each number is from that square",
      "Use the difference to adjust the perfect square",
    ],
    examples: [
      {
        problem: "19 × 21",
        solution: "399",
        explanation:
          "Near 20²=400. 19 is -1, 21 is +1. 400 + (20×1) - (20×1) - 1 = 400 - 1 = 399",
      },
      {
        problem: "29 × 31",
        solution: "899",
        explanation: "Near 30²=900. 29 is -1, 31 is +1. 900 - 1 = 899",
      },
      {
        problem: "48 × 52",
        solution: "2496",
        explanation: "Near 50²=2500. 48 is -2, 52 is +2. 2500 - 4 = 2496",
      },
    ],
    tips: [
      "Memorize perfect squares up to 15² at least",
      "This works best when numbers are equidistant from a square",
      "Practice the pattern: (n-a)(n+a) = n² - a²",
    ],
    difficulty: "Advanced",
  },

  MultiplicationTimes5: {
    description:
      "Multiply by 5 using the relationship that 5 = 10/2, so multiply by 10 then divide by 2.",
    method: [
      "Multiply the number by 10 (add a zero)",
      "Divide the result by 2",
      "That's your answer",
    ],
    examples: [
      {
        problem: "18 × 5",
        solution: "90",
        explanation: "18 × 10 = 180, then 180 ÷ 2 = 90",
      },
      {
        problem: "24 × 5",
        solution: "120",
        explanation: "24 × 10 = 240, then 240 ÷ 2 = 120",
      },
      {
        problem: "36 × 5",
        solution: "180",
        explanation: "36 × 10 = 360, then 360 ÷ 2 = 180",
      },
    ],
    tips: [
      "This is always faster than traditional multiplication by 5",
      "If the number is odd, you'll get .5 in the middle - that becomes 5 in the tens place",
      "Example: 17 × 5 = 170 ÷ 2 = 85",
    ],
    difficulty: "Beginner",
  },

  MultiplicationTimes9: {
    description:
      "Use the pattern that 9 × n = 10 × n - n, or use the finger trick for single digits.",
    method: [
      "For single digits: Use the finger method",
      "For larger numbers: Multiply by 10 then subtract the original number",
      "Look for the pattern in the digits",
    ],
    examples: [
      {
        problem: "9 × 7",
        solution: "63",
        explanation: "10 × 7 = 70, then 70 - 7 = 63. Or: fingers show 6 and 3",
      },
      {
        problem: "9 × 23",
        solution: "207",
        explanation: "10 × 23 = 230, then 230 - 23 = 207",
      },
      {
        problem: "9 × 8",
        solution: "72",
        explanation:
          "10 × 8 = 80, then 80 - 8 = 72. Notice: 7+2=9, and 7 is one less than 8",
      },
    ],
    tips: [
      "For single digits, the digits of the answer always add to 9",
      "The tens digit is always one less than the number being multiplied",
      "Finger trick: Hold up the finger for the number, bent finger separates tens and ones",
    ],
    difficulty: "Beginner",
  },

  DivisionFactorRecognition: {
    description:
      "Recognize factors and factor pairs to make division easier by breaking down the divisor.",
    method: [
      "Look for factors of the divisor",
      "Divide by the factors one at a time",
      "Use easier divisions to reach the answer",
    ],
    examples: [
      {
        problem: "144 ÷ 12",
        solution: "12",
        explanation: "12 = 4 × 3, so 144 ÷ 4 = 36, then 36 ÷ 3 = 12",
      },
      {
        problem: "180 ÷ 15",
        solution: "12",
        explanation: "15 = 5 × 3, so 180 ÷ 5 = 36, then 36 ÷ 3 = 12",
      },
      {
        problem: "196 ÷ 14",
        solution: "14",
        explanation: "14 = 7 × 2, so 196 ÷ 7 = 28, then 28 ÷ 2 = 14",
      },
    ],
    tips: [
      "Memorize factor pairs for numbers up to 20",
      "Look for factors like 2, 3, 4, 5 which are easy to divide by",
      "You can factor in any order that's convenient",
    ],
    difficulty: "Intermediate",
  },

  DivisionMultiplicationInverse: {
    description:
      "Use known multiplication facts in reverse - if you know a×b=c, then c÷a=b and c÷b=a.",
    method: [
      "Think: 'What times the divisor gives me the dividend?'",
      "Use your multiplication tables in reverse",
      "Estimate if you're not sure, then check by multiplying",
    ],
    examples: [
      {
        problem: "84 ÷ 12",
        solution: "7",
        explanation: "Think: 12 × ? = 84. Since 12 × 7 = 84, the answer is 7",
      },
      {
        problem: "91 ÷ 13",
        solution: "7",
        explanation: "Think: 13 × ? = 91. Since 13 × 7 = 91, the answer is 7",
      },
      {
        problem: "108 ÷ 9",
        solution: "12",
        explanation: "Think: 9 × ? = 108. Since 9 × 12 = 108, the answer is 12",
      },
    ],
    tips: [
      "Strong multiplication facts make this strategy very powerful",
      "Practice thinking in both directions: × and ÷",
      "If unsure, try a few multiples until you find the right one",
    ],
    difficulty: "Beginner",
  },

  DivisionEstimationAdjustment: {
    description:
      "Make an initial estimate for the quotient, then adjust based on how close your estimate × divisor is to the dividend.",
    method: [
      "Estimate the quotient (make a reasonable guess)",
      "Multiply your estimate by the divisor",
      "Adjust your estimate up or down as needed",
      "Repeat until you find the exact answer",
    ],
    examples: [
      {
        problem: "156 ÷ 13",
        solution: "12",
        explanation: "Estimate 10: 13×10=130 (too low). Try 12: 13×12=156 ✓",
      },
      {
        problem: "247 ÷ 19",
        solution: "13",
        explanation: "Estimate 10: 19×10=190 (too low). Try 13: 19×13=247 ✓",
      },
      {
        problem: "168 ÷ 14",
        solution: "12",
        explanation: "Estimate 10: 14×10=140 (too low). Try 12: 14×12=168 ✓",
      },
    ],
    tips: [
      "Start with round numbers like 10, 20 for your first estimate",
      "Use benchmark multiplications to guide your estimates",
      "This strategy helps when exact factors aren't obvious",
    ],
    difficulty: "Intermediate",
  },
};

export function StrategyHelpModal({
  strategyId,
  isOpen,
  onClose,
}: StrategyHelpModalProps) {
  if (!isOpen || !strategyId) {
    return null;
  }

  const details = STRATEGY_DISPLAY_DETAILS[strategyId];
  const content = STRATEGY_CONTENT[strategyId];

  const strategyName =
    details?.name || strategyId.replace(/([A-Z])/g, " $1").trim();
  const operationName = details?.operation || "Operation";

  if (!content) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Strategy Not Found</DialogTitle>
          </DialogHeader>
          <p>Strategy content is not available for {strategyName}.</p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-left">
                {strategyName}
              </DialogTitle>
              <DialogDescription className="text-base text-left">
                {operationName} Strategy
              </DialogDescription>
            </div>
            <Badge className={difficultyColors[content.difficulty]}>
              {content.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">What is this strategy?</h4>
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>
          </div>

          <Separator />

          {/* Method */}
          <div>
            <h4 className="font-semibold mb-2">How to use it:</h4>
            <ol className="text-sm text-muted-foreground space-y-1">
              {content.method.map((step, index) => (
                <li key={index} className="flex">
                  <span className="font-medium mr-2 text-primary">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          {/* Examples */}
          <div>
            <h4 className="font-semibold mb-3">Examples:</h4>
            <div className="space-y-4">
              {content.examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-lg font-medium">
                      {example.problem}
                    </span>
                    <span className="font-mono text-lg font-bold text-primary">
                      = {example.solution}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {example.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h4 className="font-semibold mb-2">💡 Tips for success:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Got it! Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
