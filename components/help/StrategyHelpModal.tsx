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

interface StrategyHelpModalProps {
  strategyId: StrategyId | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyHelpModal({
  strategyId,
  isOpen,
  onClose,
}: StrategyHelpModalProps) {
  if (!isOpen || !strategyId) {
    return null;
  }

  const details = STRATEGY_DISPLAY_DETAILS[strategyId];
  const strategyName = details
    ? details.name
    : strategyId.replace(/([A-Z])/g, " $1").trim();
  const operationName = details
    ? details.operation
    : strategyId.match(
        /^(Addition|Subtraction|Multiplication|Division)/,
      )?.[0] || "Operation";

  // Placeholder content - to be expanded
  const placeholderExamples: Record<string, string> = {
    AdditionBridgingTo10s:
      "e.g., for 27 + 8, think 27 + 3 = 30, then 30 + 5 = 35.",
    AdditionDoubles:
      "e.g., for 7 + 8, think 7 + 7 = 14, then 14 + 1 = 15 (as 8 is 7+1).",
    MultiplicationTimes5:
      "e.g., for 18 x 5, think (18 x 10) / 2 = 180 / 2 = 90.",
    // Add more specific examples for other key strategies
  };

  const example =
    placeholderExamples[strategyId] ||
    "Specific examples for this strategy will be added soon.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Learn: {strategyName}</DialogTitle>
          <DialogDescription>{operationName} Strategy</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3 text-sm">
          <p>
            This strategy helps you solve {operationName.toLowerCase()} problems
            more efficiently. Detailed explanations, step-by-step guides, and
            interactive tutorials for the &quot;<b>{strategyName}</b>&quot;
            strategy will be available here soon.
          </p>
          <p className="italic text-muted-foreground">{example}</p>
          <p>
            Understanding and practicing this technique can significantly
            improve your mental calculation speed and accuracy for this type of
            problem.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
