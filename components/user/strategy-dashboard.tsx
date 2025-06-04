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
import { Separator } from "@/components/ui/separator";
import { PerformanceUtils } from "@/lib/performance-thresholds";

// Water Tank Component
interface WaterTankProps {
  status: "untried" | "weak" | "good" | "mastered";
  className?: string;
}

function WaterTank({ status, className = "" }: WaterTankProps) {
  const getWaterConfig = () => {
    switch (status) {
      case "untried":
        return {
          fillPercentage: 0,
          waterColor: "transparent",
          bgColor: "bg-gray-100",
        };
      case "weak":
        return {
          fillPercentage: 30,
          waterColor: "bg-red-400",
          bgColor: "bg-gray-100",
        };
      case "good":
        return {
          fillPercentage: 70,
          waterColor: "bg-amber-300",
          bgColor: "bg-gray-100",
        };
      case "mastered":
        return {
          fillPercentage: 100,
          waterColor: "bg-emerald-500",
          bgColor: "bg-gray-100",
        };
      default:
        return {
          fillPercentage: 0,
          waterColor: "transparent",
          bgColor: "bg-gray-100",
        };
    }
  };

  const { fillPercentage, waterColor, bgColor } = getWaterConfig();

  return (
    <div className={`relative w-6 h-6 ${className}`}>
      {/* Square container */}
      <div
        className={`w-full h-full ${bgColor} rounded-sm relative overflow-hidden`}
      >
        {/* Fill */}
        {fillPercentage > 0 && (
          <div
            className={`absolute bottom-0 left-0 right-0 ${waterColor} transition-all duration-300`}
            style={{ height: `${fillPercentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function StrategyDashboard() {
  const { currentUser } = useUser();
  const {
    setFocusedStrategy,
    clearSession,
    setPracticeIntent,
    setSessionTypeIntent,
  } = useSession();
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

  // Always include all strategies, regardless of operation being enabled
  ALL_STRATEGY_IDS.forEach((strategyId) => {
    const details = STRATEGY_DISPLAY_DETAILS[strategyId];
    if (details) {
      operationGroups[details.opKey].push(strategyId);
    }
  });

  function getStrategyStatus(strategyId: StrategyId) {
    const metrics = strategyPerformance[strategyId];
    if (!metrics || metrics.totalAttempts === 0) {
      return {
        status: "untried" as const,
        accuracy: 0,
        icon: Circle,
        color: "bg-gray-100 text-gray-600",
      };
    }

    const accuracy = (metrics.correct / metrics.totalAttempts) * 100;
    const category = PerformanceUtils.getPerformanceCategory(
      metrics.correct,
      metrics.totalAttempts,
    );

    switch (category) {
      case "mastered":
        return {
          status: "mastered" as const,
          accuracy,
          icon: CheckCircle2,
          color: "bg-green-100 text-green-700",
        };
      case "good":
        return {
          status: "good" as const,
          accuracy,
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-700",
        };
      case "weak":
        return {
          status: "weak" as const,
          accuracy,
          icon: AlertTriangle,
          color: "bg-red-100 text-red-700",
        };
      default:
        return {
          status: "untried" as const,
          accuracy: 0,
          icon: Circle,
          color: "bg-gray-100 text-gray-600",
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
    clearSession();
    setFocusedStrategy(strategyId);
    setPracticeIntent(true);
    setSessionTypeIntent("focused");
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

  // Get priority strategies (weak or untried) - include all operations
  const priorityStrategies = ALL_STRATEGY_IDS.map((strategyId) => ({
    strategyId,
    ...getStrategyStatus(strategyId),
  }))
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
                      <div className="p-2 rounded">
                        <WaterTank status="untried" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Untried</p>
                        <p className="text-xs text-muted-foreground">
                          Strategy hasn&apos;t been practiced yet
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded">
                        <WaterTank status="weak" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Needs Work</p>
                        <p className="text-xs text-muted-foreground">
                          Less than 70% accuracy - focus here!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded">
                        <WaterTank status="good" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Good Progress</p>
                        <p className="text-xs text-muted-foreground">
                          70-89% accuracy - keep practicing
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded">
                        <WaterTank status="mastered" />
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
                      💡 Focus on strategies with empty or red tanks for the
                      best improvement!
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
                    ({ strategyId, status, accuracy }) => {
                      const details = STRATEGY_DISPLAY_DETAILS[strategyId];
                      const isOperationEnabled =
                        enabledOperations[details.opKey];

                      return (
                        <div
                          key={strategyId}
                          className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!isOperationEnabled ? "border-dashed border-amber-300" : ""}`}
                        >
                          <div className="flex items-center justify-center p-2">
                            <WaterTank status={status} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm truncate ${!isOperationEnabled ? "text-muted-foreground" : ""}`}
                            >
                              {details.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <p className="text-xs text-muted-foreground">
                                {status === "untried"
                                  ? "Untried"
                                  : `${Math.round(accuracy)}% accuracy`}
                              </p>
                              {!isOperationEnabled && (
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                  • {details.operation}
                                </span>
                              )}
                            </div>
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
                  const summary = getOperationSummary(strategies);
                  const operationName =
                    operation.charAt(0).toUpperCase() + operation.slice(1);
                  const {
                    icon: IconComponent,
                    color,
                    bgColor,
                    borderColor,
                  } = getOperationDisplay(operation);

                  const isOperationEnabled =
                    enabledOperations[
                      operation as keyof typeof enabledOperations
                    ];

                  return (
                    <Card
                      key={operation}
                      className={`${borderColor} ${!isOperationEnabled ? "opacity-60" : ""}`}
                    >
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
                                {!isOperationEnabled ? (
                                  "Disabled in settings"
                                ) : strategies.length === 0 ? (
                                  "No strategies available"
                                ) : (
                                  <>
                                    {strategies.length} strategies
                                    {summary.totalAttempts > 0 &&
                                      ` • ${Math.round(summary.overallAccuracy)}% avg`}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isOperationEnabled ? (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 text-xs"
                              >
                                Disabled
                              </Badge>
                            ) : strategies.length === 0 ? (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 text-xs"
                              >
                                No strategies
                              </Badge>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-4">
                          {strategies.length === 0 ? (
                            <div className="text-center py-6">
                              <p className="text-sm text-muted-foreground">
                                No strategies available for{" "}
                                {operationName.toLowerCase()}.
                              </p>
                            </div>
                          ) : (
                            <>
                              {!isOperationEnabled && (
                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  <p className="text-xs text-amber-700 dark:text-amber-300 break-words">
                                    💡 This operation is disabled in settings.
                                    You can still practice individual
                                    strategies, but they won&apos;t appear in
                                    regular sessions.
                                  </p>
                                </div>
                              )}
                              <div className="grid grid-cols-1 gap-2">
                                {strategies.map((strategyId) => {
                                  const details =
                                    STRATEGY_DISPLAY_DETAILS[strategyId];
                                  const { status, accuracy } =
                                    getStrategyStatus(strategyId);
                                  const metrics =
                                    strategyPerformance[strategyId];

                                  return (
                                    <div
                                      key={strategyId}
                                      className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group ${!isOperationEnabled ? "border-dashed border-amber-300" : ""}`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-center p-1.5 flex-shrink-0">
                                          <WaterTank status={status} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p
                                              className={`font-medium text-sm truncate ${!isOperationEnabled ? "text-muted-foreground" : ""}`}
                                            >
                                              {details.name}
                                            </p>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 flex-shrink-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setHelpModalStrategyId(
                                                  strategyId,
                                                );
                                              }}
                                            >
                                              <HelpCircle className="h-3 w-3 stroke-gray-300" />
                                            </Button>
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted-foreground break-words">
                                              {metrics &&
                                              metrics.totalAttempts > 0
                                                ? `${Math.round(accuracy)}% (${metrics.totalAttempts} attempts)`
                                                : "Not tried"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={
                                          status === "weak"
                                            ? "default"
                                            : "outline"
                                        }
                                        onClick={() =>
                                          handlePracticeStrategy(strategyId)
                                        }
                                        className="ml-2 flex-shrink-0"
                                      >
                                        Practice
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
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
