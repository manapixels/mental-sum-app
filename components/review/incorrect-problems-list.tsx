"use client";

import React, { useState, useMemo } from "react";
import { useUser } from "@/lib/contexts/user-context";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { IncorrectProblemCard } from "./incorrect-problem-card";
import { Problem, StrategyId } from "@/lib/types";
import { STRATEGY_DISPLAY_DETAILS } from "@/components/user/user-strategy-progress-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SortOption = "date-desc" | "date-asc" | "strategy-name";

export function IncorrectProblemsList() {
  const { currentUser } = useUser();
  const { setFocusedStrategy, clearSession } = useSession();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterByStrategy, setFilterByStrategy] = useState<StrategyId | "all">(
    "all",
  );

  const allIncorrectProblems = useMemo(() => {
    if (!currentUser || !currentUser.statistics.problemHistory) {
      return [];
    }

    const incorrectProblems = currentUser.statistics.problemHistory.filter(
      (p: Problem) => {
        const hasCompletedAt = !!p.completedAt;
        const hasUserAnswer = p.userAnswer !== undefined;
        const isIncorrect = p.isCorrect === false;

        return hasCompletedAt && hasUserAnswer && isIncorrect;
      },
    );

    return incorrectProblems;
  }, [currentUser]);

  const availableStrategiesForFilter = useMemo(() => {
    const strategyIds = new Set<StrategyId>();
    allIncorrectProblems.forEach((p) => strategyIds.add(p.intendedStrategy));
    return Array.from(strategyIds).sort((a, b) => {
      const detailA = STRATEGY_DISPLAY_DETAILS[a];
      const detailB = STRATEGY_DISPLAY_DETAILS[b];
      return (detailA?.name || a).localeCompare(detailB?.name || b);
    });
  }, [allIncorrectProblems]);

  const processedProblems = useMemo(() => {
    let problems = [...allIncorrectProblems];

    // Filter
    if (filterByStrategy !== "all") {
      problems = problems.filter(
        (p) => p.intendedStrategy === filterByStrategy,
      );
    }

    // Sort
    switch (sortBy) {
      case "date-asc":
        problems.sort(
          (a, b) =>
            new Date(a.attemptedAt).getTime() -
            new Date(b.attemptedAt).getTime(),
        );
        break;
      case "strategy-name":
        problems.sort((a, b) => {
          const nameA =
            STRATEGY_DISPLAY_DETAILS[a.intendedStrategy]?.name ||
            a.intendedStrategy;
          const nameB =
            STRATEGY_DISPLAY_DETAILS[b.intendedStrategy]?.name ||
            b.intendedStrategy;
          return nameA.localeCompare(nameB);
        });
        break;
      case "date-desc":
      default:
        problems.sort(
          (a, b) =>
            new Date(b.attemptedAt).getTime() -
            new Date(a.attemptedAt).getTime(),
        );
        break;
    }
    return problems;
  }, [allIncorrectProblems, sortBy, filterByStrategy]);

  if (!currentUser || !currentUser.statistics.problemHistory) {
    return (
      <div className="py-10">
        <p className="text-muted-foreground">
          Loading review data or no user selected...
        </p>
      </div>
    );
  }

  const handlePracticeStrategy = (strategyId: StrategyId) => {
    clearSession();
    setFocusedStrategy(strategyId);
    router.push("/session");
  };

  if (allIncorrectProblems.length === 0) {
    return (
      <div className="py-10">
        <p className="text-xl font-semibold">All Clear!</p>
        <p className="text-muted-foreground">
          You have no incorrect answers to review right now. Keep up the great
          work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Review Your Mistakes ({allIncorrectProblems.length} problems)
          </h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Here are the problems you answered incorrectly. Use this to learn
            and improve!
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <Label htmlFor="filter-strategy" className="text-xs">
              Filter by Strategy
            </Label>
            <Select
              value={filterByStrategy}
              onValueChange={(value) =>
                setFilterByStrategy(value as StrategyId | "all")
              }
            >
              <SelectTrigger
                id="filter-strategy"
                className="w-full sm:w-[180px]"
              >
                <SelectValue placeholder="Filter by strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {availableStrategiesForFilter.map((strategyId) => (
                  <SelectItem key={strategyId} value={strategyId}>
                    {STRATEGY_DISPLAY_DETAILS[strategyId]?.name || strategyId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto">
            <Label htmlFor="sort-by" className="text-xs">
              Sort by
            </Label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger id="sort-by" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Most Recent</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="strategy-name">Strategy Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {processedProblems.length === 0 && filterByStrategy !== "all" && (
        <div className="py-10">
          <p className="text-muted-foreground">
            No incorrect answers found for the selected strategy:{" "}
            {STRATEGY_DISPLAY_DETAILS[filterByStrategy]?.name ||
              filterByStrategy}
            .
          </p>
        </div>
      )}

      {processedProblems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedProblems.map((problem) => (
            <IncorrectProblemCard
              key={problem.id}
              problem={problem}
              onPractice={handlePracticeStrategy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
