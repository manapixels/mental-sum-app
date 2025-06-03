import React from "react";
import { UserStatistics } from "@/lib/types";
import {
  Target,
  CheckCircle,
  XCircle,
  BarChart2,
  Clock,
  Award,
  Calendar,
} from "lucide-react"; // Icons

interface UserOverallStatsProps {
  statistics: UserStatistics;
}

const StatItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  unit?: string;
}> = ({ icon: Icon, label, value, unit }) => (
  <div className="flex items-start space-x-3 p-3 bg-card rounded-lg border">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">
        {value !== undefined && value !== null ? value : "N/A"}
        {unit && value !== undefined && value !== null ? (
          <span className="text-xs"> {unit}</span>
        ) : (
          ""
        )}
      </p>
    </div>
  </div>
);

export function UserOverallStats({ statistics }: UserOverallStatsProps) {
  const {
    totalProblems,
    correctAnswers,
    wrongAnswers,
    totalSessions,
    averageTimePerProblem,
    currentStreak,
    bestStreak,
    lastSessionDate,
  } = statistics;

  const overallAccuracy =
    totalProblems && totalProblems > 0
      ? ((correctAnswers || 0) / totalProblems) * 100
      : 0;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold tracking-tight mb-4">
        Overall Performance
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatItem
          icon={Target}
          label="Total Problems"
          value={totalProblems || 0}
        />
        <StatItem
          icon={CheckCircle}
          label="Correct Answers"
          value={correctAnswers || 0}
        />
        <StatItem
          icon={XCircle}
          label="Wrong Answers"
          value={wrongAnswers || 0}
        />
        <StatItem
          icon={BarChart2}
          label="Overall Accuracy"
          value={totalProblems ? overallAccuracy.toFixed(1) : "N/A"}
          unit="%"
        />
        <StatItem
          icon={Clock}
          label="Avg. Time/Problem"
          value={
            averageTimePerProblem ? averageTimePerProblem.toFixed(1) : "N/A"
          }
          unit="s"
        />
        <StatItem icon={Award} label="Best Streak" value={bestStreak || 0} />
        <StatItem
          icon={Award}
          label="Current Streak"
          value={currentStreak || 0}
        />
        <StatItem
          icon={Calendar}
          label="Last Session"
          value={
            lastSessionDate
              ? new Date(lastSessionDate).toLocaleDateString()
              : "N/A"
          }
        />
        <StatItem
          icon={BarChart2}
          label="Total Sessions"
          value={totalSessions || 0}
        />
      </div>
    </div>
  );
}
