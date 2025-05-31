"use client";

import { Problem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Divide } from "lucide-react";

interface ProblemDisplayProps {
  problem: Problem;
  showStrategy?: boolean;
}

export function ProblemDisplay({
  problem,
  showStrategy = false,
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
    <Card className="w-full max-w-md">
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

        {/* Math problem */}
        <div className="text-center space-y-4">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-wide">
            <span>{problem.operand1}</span>
            <span
              className={`mx-3 sm:mx-4 ${getOperationColor(problem.operation)}`}
            >
              {getOperationSymbol(problem.operation)}
            </span>
            <span>{problem.operand2}</span>
          </div>

          <div className="text-4xl sm:text-5xl font-bold font-mono text-muted-foreground">
            = ?
          </div>
        </div>

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
