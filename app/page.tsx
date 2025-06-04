import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Separator } from "@/components/ui/separator";
import { UserStatsSection } from "@/components/home/user-stats-section";
import { PracticeSection } from "@/components/home/practice-section";
import { StrategySection } from "@/components/home/strategy-section";

export const metadata: Metadata = {
  title: "Dashboard - ne.ko",
  description: "View your mental math progress and start practice sessions.",
};

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <UserStatsSection />
        <PracticeSection />
        <Separator />
        <StrategySection />
      </div>
    </MainLayout>
  );
}
