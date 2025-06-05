import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SessionResultsContent } from "@/components/session/session-results-content";

export const metadata: Metadata = {
  title: "Session Results - neko+",
  description: "View your practice session results and performance analysis.",
};

export default function SessionResultsPage() {
  return (
    <MainLayout>
      <SessionResultsContent />
    </MainLayout>
  );
}
