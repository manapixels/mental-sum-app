import React from "react";
import { Problem, StrategyId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { STRATEGY_DISPLAY_DETAILS } from "@/components/user/UserStrategyProgressList";

interface IncorrectProblemCardProps {
  problem: Problem;
  onPractice: (strategyId: StrategyId) => void;
}

const getOperatorSymbol = (typeInput: Problem["type"] | undefined): string => {
  if (typeof typeInput === "string") {
    switch (typeInput) {
      case "addition":
        return "+";
      case "subtraction":
        return "-";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        console.error(
          `ProblemDisplay: Received unexpected type string: '${typeInput}'`,
        );
        return "?";
    }
  } else {
    console.error(
      `ProblemDisplay: Received invalid or undefined type:`,
      typeInput,
    );
    return "?";
  }
};

export function IncorrectProblemCard({
  problem,
  onPractice,
}: IncorrectProblemCardProps) {
  const strategyDetails = STRATEGY_DISPLAY_DETAILS[problem.intendedStrategy];
  const strategyDisplayName = strategyDetails
    ? `${strategyDetails.operation}: ${strategyDetails.name}`
    : problem.intendedStrategy;
  const symbol = getOperatorSymbol(problem.type);

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg leading-tight">
          <span className={`font-mono text-lg`}>
            {problem.operands[0]} {symbol} {problem.operands[1]}
          </span>
        </CardTitle>
        {problem.attemptedAt && (
          <CardDescription>
            Attempted: {new Date(problem.attemptedAt).toLocaleDateString()}{" "}
            {new Date(problem.attemptedAt).toLocaleTimeString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2 flex-grow text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Your Answer:</span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {problem.userAnswer ?? "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Correct Answer:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {problem.correctAnswer}
          </span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-muted-foreground">Intended Strategy:</span>
          <span className="font-semibold">{strategyDisplayName}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onPractice(problem.intendedStrategy)}
          className="w-full"
          variant="outline"
          size="sm"
        >
          Practice this Skill
        </Button>
      </CardFooter>
    </Card>
  );
}
