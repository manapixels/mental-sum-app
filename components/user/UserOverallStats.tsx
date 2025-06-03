import React from "react";
import { UserStatistics } from "@/lib/types";
import { formatRelativeDate } from "@/lib/date-utils";

interface UserOverallStatsProps {
  statistics: UserStatistics;
}

export function UserOverallStats({ statistics }: UserOverallStatsProps) {
  const { averageTimePerProblem, lastSessionDate, totalProblems } = statistics;

  return (
    <div className="mb-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Overall Performance
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 items-end">
            <span className="text-8xl font-bold text-gray-800">
              {totalProblems.toLocaleString() || 0}
            </span>
            <span className="text-sm text-muted-foreground">
              Problems
              <br />
              Attempted
            </span>
          </div>
          <div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                Last session:{" "}
                <span className="text-gray-700 font-medium">
                  {formatRelativeDate(lastSessionDate) || "N/A"}
                </span>
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                Avg. Time / Problem:{" "}
                <span className="text-gray-700 font-medium">
                  {averageTimePerProblem
                    ? averageTimePerProblem.toFixed(1)
                    : "N/A"}
                  s
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
