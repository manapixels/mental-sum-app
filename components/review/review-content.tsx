"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { IncorrectProblemsList } from "@/components/review/incorrect-problems-list";

function ReviewSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-muted rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-muted rounded"></div>
        <div className="h-16 bg-muted rounded"></div>
        <div className="h-16 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function ReviewContent() {
  const router = useRouter();
  const { currentUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return <ReviewSkeleton />;
  }

  if (!currentUser) {
    return null; // Will redirect
  }

  return <IncorrectProblemsList />;
}
