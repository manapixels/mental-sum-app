import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { ReviewContent } from "@/components/review/review-content";

export const metadata: Metadata = {
  title: "Review Mistakes - neko+",
  description:
    "Review and learn from your incorrect answers to improve your mental math skills.",
};

export default function ReviewPage() {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Review mistakes
        </h1>
      </div>
      <ReviewContent />
    </MainLayout>
  );
}
