import React from "react";
import { UserStatistics } from "@/lib/types";
import { formatRelativeDate } from "@/lib/date-utils";
// import {
//   Target,
//   BarChart2,
//   Clock,
//   Award,
//   Calendar,
// } from "lucide-react"; // Icons

interface UserOverallStatsProps {
  statistics: UserStatistics;
}

// const StatItem: React.FC<{
//   icon: React.ElementType;
//   label: string;
//   value: string | number | undefined;
//   unit?: string;
//   className?: string;
// }> = ({ icon: Icon, label, value, unit, className }) => (
//   <div className={`flex items-start space-x-3 p-3 bg-card rounded-lg border ${className}`}>
//     <Icon className="h-5 w-5 text-muted-foreground mt-1" />
//     <div>
//       <p className="text-xs text-muted-foreground">{label}</p>
//       <p className="text-base font-semibold">
//         {value !== undefined && value !== null ? value : "N/A"}
//         {unit && value !== undefined && value !== null ? (
//           <span className="text-xs"> {unit}</span>
//         ) : (
//           ""
//         )}
//       </p>
//     </div>
//   </div>
// );

export function UserOverallStats({ statistics }: UserOverallStatsProps) {
  const { averageTimePerProblem, lastSessionDate } = statistics;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold tracking-tight mb-4">
        Overall Performance
      </h2>
      <div className="flex flex-row gap-4 items-end">
        <span className="text-8xl font-bold">
          {averageTimePerProblem ? averageTimePerProblem.toFixed(1) : "N/A"}s
        </span>
        <span className="text-sm text-muted-foreground">
          Avg. Time / Problem
        </span>
      </div>
      <div className="mt-6">
        <span className="text-muted-foreground">
          Last session: {formatRelativeDate(lastSessionDate) || "N/A"}
        </span>
      </div>
      {/* <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatItem
          icon={Target}
          label="Total Problems"
          value={totalProblems || 0}
        />
        <StatItem
          icon={BarChart2}
          label="Overall Accuracy"
          value={totalProblems ? overallAccuracy.toFixed(1) : "N/A"}
          unit="%"
        />
        <StatItem
          icon={Clock}
          label="Avg. Time / Problem"
          value={
            averageTimePerProblem ? averageTimePerProblem.toFixed(1) : "N/A"
          }
          unit="s"
        />
        <StatItem icon={Award} label="Best Streak" value={bestStreak || 0} />
        <StatItem
          icon={Calendar}
          label="Last Session"
          className="col-span-2"
          value={formatRelativeDate(lastSessionDate)}
        />
      </div> */}
    </div>
  );
}
