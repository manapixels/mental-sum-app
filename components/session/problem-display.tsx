"use client";

import { Problem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, Divide } from "lucide-react";
import { AnswerInput } from "./answer-input";
import { NumberKeypad } from "./number-keypad";

interface ProblemDisplayProps {
  problem: Problem;
  showStrategy?: boolean;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onNumberPress: (number: string) => void;
  onBackspace: () => void;
  onKeypadSubmit: () => void;
  disabled?: boolean;
  feedbackType: "correct" | "incorrect" | "timeout" | null;
}

export function ProblemDisplay({
  problem,
  showStrategy = false,
  userAnswer,
  onAnswerChange,
  onSubmit,
  onKeyPress,
  onNumberPress,
  onBackspace,
  onKeypadSubmit,
  disabled = false,
  feedbackType,
}: ProblemDisplayProps) {
  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case "addition":
        return "+";
      case "subtraction":
        return "−";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return "+";
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "addition":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "subtraction":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "multiplication":
        return <X className="h-4 w-4 text-blue-600" />;
      case "division":
        return <Divide className="h-4 w-4 text-purple-600" />;
      default:
        return <Plus className="h-4 w-4 text-green-600" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "addition":
        return "text-green-600";
      case "subtraction":
        return "text-red-600";
      case "multiplication":
        return "text-blue-600";
      case "division":
        return "text-purple-600";
      default:
        return "text-green-600";
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardContent className="p-6 sm:p-8">
        {/* Operation type badge */}
        <div className="flex items-center justify-center mb-6">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-sm"
          >
            {getOperationIcon(problem.operation)}
            {problem.operation.charAt(0).toUpperCase() +
              problem.operation.slice(1)}
          </Badge>
        </div>

        {/* Math problem with integrated answer */}
        <div className="text-center space-y-6">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-wide">
            <span>{problem.operand1}</span>
            <span
              className={`mx-3 sm:mx-4 ${getOperationColor(problem.operation)}`}
            >
              {getOperationSymbol(problem.operation)}
            </span>
            <span>{problem.operand2}</span>
          </div>

          <div className="text-4xl sm:text-5xl font-bold font-mono text-muted-foreground flex items-center justify-center gap-3">
            <span>=</span>

            {/* Check if we're on mobile */}
            {typeof window !== "undefined" && window.innerWidth < 768 ? (
              // Mobile: Show answer display
              <div className="min-w-[120px] px-4 py-2 text-3xl sm:text-4xl font-bold text-center text-blue-600 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                {userAnswer || "?"}
              </div>
            ) : (
              // Desktop: Show input field
              <div className="min-w-[120px]">
                <AnswerInput
                  value={userAnswer}
                  onChange={onAnswerChange}
                  onKeyPress={onKeyPress}
                  disabled={disabled}
                  placeholder="?"
                />
              </div>
            )}
          </div>

          {/* Desktop Submit Button */}
          {typeof window !== "undefined" && window.innerWidth >= 768 && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={onSubmit}
                disabled={
                  !userAnswer.trim() || disabled || feedbackType !== null
                }
                size="lg"
                className="px-8 h-12"
              >
                Submit Answer
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Number Keypad */}
        {typeof window !== "undefined" && window.innerWidth < 768 && (
          <div className="mt-6">
            <NumberKeypad
              onNumberPress={onNumberPress}
              onBackspace={onBackspace}
              onSubmit={onKeypadSubmit}
              disabled={disabled || feedbackType !== null}
            />
          </div>
        )}

        {/* Strategy hint */}
        {showStrategy && problem.strategyCategory && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              💡 Strategy Hint:
            </div>
            <div className="text-sm">{getStrategyHint(problem)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStrategyHint(problem: Problem): string {
  switch (problem.strategyCategory) {
    case "bridging-to-tens":
      return `Try making ${problem.operand2} a round number like ${Math.ceil(problem.operand2 / 10) * 10}, then adjust.`;

    case "doubles":
      return `Notice how close these numbers are! Use doubling strategies.`;

    case "times-9":
      return `For × 9: multiply by 10, then subtract the original number.`;

    case "times-5":
      return `For × 5: multiply by 10, then divide by 2.`;

    case "times-11":
      return `For × 11: write the number twice, then add the middle digits.`;

    case "compensation":
      return `Round ${problem.operand2} to make it easier, then adjust your answer.`;

    case "adding-up":
      return `Try counting up from ${problem.operand2} to ${problem.operand1}.`;

    case "factor-recognition":
      return `Look for familiar multiplication facts in this division.`;

    default:
      return `Take your time and work step by step.`;
  }
}
