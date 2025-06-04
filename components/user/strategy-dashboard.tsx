"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/contexts/user-context";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  HelpCircle,
  Info,
  Plus,
  Minus,
  X,
  Divide,
} from "lucide-react";
import { ALL_STRATEGY_IDS, StrategyId } from "@/lib/types";
import { STRATEGY_DISPLAY_DETAILS } from "./user-strategy-progress-list";
import { StrategyHelpModal } from "@/components/help/strategy-help-modal";
import { Separator } from "../ui/separator";

export function StrategyDashboard() {
  const { currentUser } = useUser();
  const { setFocusedStrategy } = useSession();
  const router = useRouter();
  const [helpModalStrategyId, setHelpModalStrategyId] =
    useState<StrategyId | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  if (
    !currentUser?.statistics.strategyPerformance ||
    !currentUser.preferences
  ) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Loading progress data...</p>
      </div>
    );
  }

  const { strategyPerformance } = currentUser.statistics;
  const { enabledOperations } = currentUser.preferences;

  // Group strategies by operation
  const operationGroups = {
    addition: [] as StrategyId[],
    subtraction: [] as StrategyId[],
    multiplication: [] as StrategyId[],
    division: [] as StrategyId[],
  };

  ALL_STRATEGY_IDS.forEach((strategyId) => {
    const details = STRATEGY_DISPLAY_DETAILS[strategyId];
    if (details && enabledOperations[details.opKey]) {
      operationGroups[details.opKey].push(strategyId);
    }
  });

  function getStrategyStatus(strategyId: StrategyId) {
    const metrics = strategyPerformance[strategyId];
    if (!metrics || metrics.totalAttempts === 0) {
      return {
        status: "untried",
        accuracy: 0,
        icon: Circle,
        color: "bg-gray-100 text-gray-600",
      };
    }

    const accuracy = (metrics.correct / metrics.totalAttempts) * 100;

    if (accuracy >= 90 && metrics.totalAttempts >= 5) {
      return {
        status: "mastered",
        accuracy,
        icon: CheckCircle2,
        color: "bg-green-100 text-green-700",
      };
    } else if (accuracy >= 70) {
      return {
        status: "good",
        accuracy,
        icon: TrendingUp,
        color: "bg-blue-100 text-blue-700",
      };
    } else {
      return {
        status: "weak",
        accuracy,
        icon: AlertTriangle,
        color: "bg-red-100 text-red-700",
      };
    }
  }

  function getOperationSummary(strategies: StrategyId[]) {
    let totalAttempts = 0;
    let totalCorrect = 0;
    const statusCounts = { untried: 0, weak: 0, good: 0, mastered: 0 };

    strategies.forEach((strategyId) => {
      const { status } = getStrategyStatus(strategyId);
      const metrics = strategyPerformance[strategyId];

      statusCounts[status as keyof typeof statusCounts]++;

      if (metrics && metrics.totalAttempts > 0) {
        totalAttempts += metrics.totalAttempts;
        totalCorrect += metrics.correct;
      }
    });

    const overallAccuracy =
      totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    return { overallAccuracy, statusCounts, totalAttempts };
  }

  const handlePracticeStrategy = (strategyId: StrategyId) => {
    setFocusedStrategy(strategyId);
    router.push("/session");
  };

  const hasData = Object.values(strategyPerformance).some(
    (m) => m.totalAttempts > 0,
  );

  // Get operation icon and color
  const getOperationDisplay = (operation: string) => {
    switch (operation) {
      case "addition":
        return {
          icon: Plus,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "subtraction":
        return {
          icon: Minus,
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "multiplication":
        return {
          icon: X,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "division":
        return {
          icon: Divide,
          color: "text-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        };
      default:
        return {
          icon: Circle,
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
          borderColor: "border-muted",
        };
    }
  };

  // Get priority strategies (weak or untried)
  const priorityStrategies = ALL_STRATEGY_IDS.filter((id) => {
    const details = STRATEGY_DISPLAY_DETAILS[id];
    return details && enabledOperations[details.opKey];
  })
    .map((strategyId) => ({ strategyId, ...getStrategyStatus(strategyId) }))
    .filter((s) => s.status === "weak" || s.status === "untried")
    .sort((a, b) => {
      // Prioritize weak over untried, then by accuracy
      if (a.status === "weak" && b.status === "untried") return -1;
      if (a.status === "untried" && b.status === "weak") return 1;
      if (a.status === "weak" && b.status === "weak")
        return a.accuracy - b.accuracy;
      return 0;
    })
    .slice(0, 4);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Skills Progress
            </h2>
            <Dialog open={isLegendOpen} onOpenChange={setIsLegendOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Performance Indicators</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-gray-100">
                        <Circle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Untried</p>
                        <p className="text-xs text-muted-foreground">
                          Strategy hasn&apos;t been practiced yet
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Needs Work</p>
                        <p className="text-xs text-muted-foreground">
                          Less than 70% accuracy - focus here!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-blue-100">
                        <TrendingUp className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Good Progress</p>
                        <p className="text-xs text-muted-foreground">
                          70-89% accuracy - keep practicing
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-green-100">
                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Mastered</p>
                        <p className="text-xs text-muted-foreground">
                          90%+ accuracy with 5+ attempts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 Focus on strategies marked with red (needs work) or
                      gray (untried) for the best improvement!
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!hasData && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Complete a few practice sessions to see your progress for
              different mental math strategies here.
            </p>
          </Card>
        )}

        {hasData && (
          <>
            {/* Priority Focus Section */}
            {priorityStrategies.length > 0 && (
              <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Priority Focus ({priorityStrategies.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {priorityStrategies.map(
                    ({ strategyId, status, accuracy, icon: Icon, color }) => {
                      const details = STRATEGY_DISPLAY_DETAILS[strategyId];
                      return (
                        <div
                          key={strategyId}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className={`p-2 rounded-full ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {details.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {status === "untried"
                                ? "Untried"
                                : `${Math.round(accuracy)}% accuracy`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={status === "weak" ? "default" : "outline"}
                            onClick={() => handlePracticeStrategy(strategyId)}
                            className="ml-2"
                          >
                            Practice
                          </Button>
                        </div>
                      );
                    },
                  )}
                </div>
              </Card>
            )}

            <Separator />

            {/* Operation Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(operationGroups).map(
                ([operation, strategies]) => {
                  if (strategies.length === 0) return null;

                  const summary = getOperationSummary(strategies);
                  const operationName =
                    operation.charAt(0).toUpperCase() + operation.slice(1);
                  const {
                    icon: IconComponent,
                    color,
                    bgColor,
                    borderColor,
                  } = getOperationDisplay(operation);

                  return (
                    <Card key={operation} className={`${borderColor}`}>
                      <CardContent className="p-0">
                        <div
                          className={`flex items-center justify-between p-4 ${bgColor} rounded-t-xl`}
                        >
                          <div className="flex items-center gap-3">
                            {React.createElement(IconComponent, {
                              className: `h-5 w-5 ${color}`,
                            })}
                            <div>
                              <h3 className={`font-semibold ${color}`}>
                                {operationName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {strategies.length} strategies
                                {summary.totalAttempts > 0 &&
                                  ` • ${Math.round(summary.overallAccuracy)}% avg`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {summary.statusCounts.mastered > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 text-xs"
                              >
                                {summary.statusCounts.mastered} done
                              </Badge>
                            )}
                            {summary.statusCounts.weak > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-700 text-xs"
                              >
                                {summary.statusCounts.weak} weak
                              </Badge>
                            )}
                            {summary.statusCounts.untried > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 text-xs"
                              >
                                {summary.statusCounts.untried} new
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 gap-2">
                          {strategies.map((strategyId) => {
                            const details =
                              STRATEGY_DISPLAY_DETAILS[strategyId];
                            const {
                              status,
                              accuracy,
                              icon: Icon,
                              color,
                            } = getStrategyStatus(strategyId);
                            const metrics = strategyPerformance[strategyId];

                            return (
                              <div
                                key={strategyId}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`p-1.5 rounded ${color}`}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-sm truncate">
                                        {details.name}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHelpModalStrategyId(strategyId);
                                        }}
                                      >
                                        <HelpCircle className="h-3 w-3 stroke-gray-300" />
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        {metrics && metrics.totalAttempts > 0
                                          ? `${Math.round(accuracy)}% (${metrics.totalAttempts} attempts)`
                                          : "Not tried"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={
                                    status === "weak" ? "default" : "outline"
                                  }
                                  onClick={() =>
                                    handlePracticeStrategy(strategyId)
                                  }
                                  className="ml-2"
                                >
                                  Practice
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                },
              )}
            </div>
          </>
        )}
      </div>

      <StrategyHelpModal
        strategyId={helpModalStrategyId}
        isOpen={!!helpModalStrategyId}
        onClose={() => setHelpModalStrategyId(null)}
      />
    </>
  );
}
