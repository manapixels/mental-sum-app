"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { MainLayout } from "@/components/layout/main-layout";
import { IncorrectProblemsList } from "@/components/review/incorrect-problems-list";

export default function ReviewPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/"); // Redirect if not logged in
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 text-center">
          <p>Loading review page...</p>
        </div>
      </MainLayout>
    );
  }

  if (!currentUser) {
    return null; // Or a message indicating redirection
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Review Incorrect Answers
        </h1>
        <p className="text-muted-foreground mt-2">
          Review problems you got wrong to learn from your mistakes and improve
          your mental math skills.
        </p>
      </div>

      <IncorrectProblemsList />
    </MainLayout>
  );
}
