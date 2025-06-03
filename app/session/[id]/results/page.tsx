"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { Session } from "@/lib/types"; // Problem import might not be needed if SessionResults handles it
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionResults } from "@/components/session/session-results";
import { MainLayout } from "@/components/layout/main-layout";

export default function SessionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, getSessionById } = useUser(); // Destructure getSessionById
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const sessionId = typeof params.id === "string" ? params.id : undefined;

  useEffect(() => {
    if (currentUser && sessionId && getSessionById) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession); // Will be null if not found or not authorized, triggering the 'Session Not Found' UI
    } else if (!currentUser && sessionId) {
      // Still loading current user, or getSessionById not available yet (shouldn't happen if context is set up)
      setSession(undefined);
    } else if (!sessionId) {
      // No session ID in params
      setSession(null);
    }
  }, [currentUser, sessionId, getSessionById]);

  if (session === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-8 text-center">
          <p className="text-lg">Loading session results...</p>
          {/* Spinner can be added here */}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Session Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The session results you are looking for could not be found or you do
          not have permission to view it.
        </p>
        <Button asChild>
          <Link href={"/"}>
            {currentUser ? "View Your Progress" : "Go Home"}
          </Link>
        </Button>
      </div>
    );
  }

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleNewSession = () => {
    router.push("/session");
  };

  return (
    <MainLayout>
      <SessionResults
        session={session}
        onBackToHome={handleBackToHome}
        onNewSession={handleNewSession}
      />
    </MainLayout>
  );
}

// Removed getOperationSymbol function as it's no longer used here
