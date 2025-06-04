"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/contexts/user-context";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { StrategyProgressCard } from "./strategy-progress-card";
import { ALL_STRATEGY_IDS, StrategyId, UserPreferences } from "@/lib/types";
import { StrategyHelpModal } from "@/components/help/strategy-help-modal";

// Helper to get a user-friendly display name and operation for each strategy
// This could be expanded or moved to a utility file
export const STRATEGY_DISPLAY_DETAILS: Record<
  StrategyId,
  {
    name: string;
    operation: string;
    opKey: keyof UserPreferences["enabledOperations"];
  }
> = {
  AdditionBridgingTo10s: {
    name: "Bridging to 10s",
    operation: "Addition",
    opKey: "addition",
  },
  AdditionDoubles: {
    name: "Doubles",
    operation: "Addition",
    opKey: "addition",
  },
  AdditionBreakingApart: {
    name: "Breaking Apart",
    operation: "Addition",
    opKey: "addition",
  },
  AdditionLeftToRight: {
    name: "Left-to-Right",
    operation: "Addition",
    opKey: "addition",
  },
  SubtractionBridgingDown: {
    name: "Bridging Down",
    operation: "Subtraction",
    opKey: "subtraction",
  },
  SubtractionAddingUp: {
    name: "Adding Up",
    operation: "Subtraction",
    opKey: "subtraction",
  },
  SubtractionCompensation: {
    name: "Compensation",
    operation: "Subtraction",
    opKey: "subtraction",
  },
  MultiplicationDoubling: {
    name: "Doubling & Halving",
    operation: "Multiplication",
    opKey: "multiplication",
  },
  MultiplicationBreakingApart: {
    name: "Breaking Apart",
    operation: "Multiplication",
    opKey: "multiplication",
  },
  MultiplicationNearSquares: {
    name: "Near Squares",
    operation: "Multiplication",
    opKey: "multiplication",
  },
  MultiplicationTimes5: {
    name: "Times 5",
    operation: "Multiplication",
    opKey: "multiplication",
  },
  MultiplicationTimes9: {
    name: "Times 9 (or near 10s)",
    operation: "Multiplication",
    opKey: "multiplication",
  },
  DivisionFactorRecognition: {
    name: "Factor Recognition",
    operation: "Division",
    opKey: "division",
  },
  DivisionMultiplicationInverse: {
    name: "Multiplication Inverse",
    operation: "Division",
    opKey: "division",
  },
  DivisionEstimationAdjustment: {
    name: "Estimation & Adjustment",
    operation: "Division",
    opKey: "division",
  },
};

export function UserStrategyProgressList() {
  const { currentUser } = useUser();
  const { setFocusedStrategy, clearSession } = useSession();
  const router = useRouter();
  const [helpModalStrategyId, setHelpModalStrategyId] =
    useState<StrategyId | null>(null);

  if (
    !currentUser ||
    !currentUser.statistics.strategyPerformance ||
    !currentUser.preferences
  ) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Loading progress data or no user selected...
        </p>
      </div>
    );
  }

  const { strategyPerformance, problemHistory } = currentUser.statistics;
  const { enabledOperations } = currentUser.preferences;

  const handlePracticeStrategy = (strategyId: StrategyId) => {
    clearSession();
    setFocusedStrategy(strategyId);
    router.push("/session");
  };

  const openHelpModal = (strategyId: StrategyId) =>
    setHelpModalStrategyId(strategyId);
  const closeHelpModal = () => setHelpModalStrategyId(null);

  const enabledStrategyIds = ALL_STRATEGY_IDS.filter((id) => {
    const details = STRATEGY_DISPLAY_DETAILS[id];
    return details && enabledOperations[details.opKey];
  });

  if (enabledStrategyIds.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          No calculation types are currently enabled in settings. Please enable
          some to see your strategy progress.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Skill Progress</h2>
        {problemHistory &&
          problemHistory.length === 0 &&
          Object.values(strategyPerformance).every(
            (m) => m.totalAttempts === 0,
          ) && (
            <p className="text-sm text-muted-foreground">
              Complete a few practice sessions to see your progress for
              different mental math strategies here.
            </p>
          )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enabledStrategyIds.map((strategyId) => {
            const metrics = strategyPerformance[strategyId];
            const displayDetails = STRATEGY_DISPLAY_DETAILS[strategyId];

            if (!metrics || !displayDetails) {
              console.warn(
                `UserStrategyProgressList: Missing metrics or display details for strategy: ${strategyId}`,
              );
              return null;
            }

            return (
              <StrategyProgressCard
                key={strategyId}
                strategyId={strategyId}
                metrics={metrics}
                strategyDisplayName={displayDetails.name}
                operationName={displayDetails.operation}
                onPractice={handlePracticeStrategy}
                onLearnMore={openHelpModal}
              />
            );
          })}
        </div>
      </div>
      <StrategyHelpModal
        strategyId={helpModalStrategyId}
        isOpen={!!helpModalStrategyId}
        onClose={closeHelpModal}
      />
    </>
  );
}
