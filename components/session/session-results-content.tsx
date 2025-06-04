"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { useSession } from "@/lib/contexts/session-context";
import { Session } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionResults } from "@/components/session/session-results";
import { STRATEGY_DISPLAY_DETAILS } from "@/components/user/user-strategy-progress-list";

function SessionResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
      <div className="h-64 bg-muted rounded"></div>
    </div>
  );
}

export function SessionResultsContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, getSessionById } = useUser();
  const {
    clearSession,
    startSameTypeSession,
    lastSessionType,
    focusedStrategyId,
    clearFocusedStrategy,
    setPracticeIntent,
    setSessionTypeIntent,
  } = useSession();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const sessionId = typeof params.id === "string" ? params.id : undefined;

  useEffect(() => {
    if (currentUser && sessionId && getSessionById) {
      const foundSession = getSessionById(sessionId);
      setSession(foundSession);
    } else if (!currentUser && sessionId) {
      setSession(undefined);
    } else if (!sessionId) {
      setSession(null);
    }
  }, [currentUser, sessionId, getSessionById]);

  if (session === undefined) {
    return <SessionResultsSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] text-center p-4">
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
    clearSession();
    router.push("/");
  };

  const handleNewSession = () => {
    clearSession();
    // Clear focused strategy IMMEDIATELY to prevent auto-session from using it
    clearFocusedStrategy();
    // Set practice intent for general session
    setPracticeIntent(true);
    setSessionTypeIntent("general"); // Explicitly set general session intent
    router.push("/session");
  };

  const handleSameTypeSession = () => {
    // Set practice intent for same-type session
    setPracticeIntent(true);
    setSessionTypeIntent(lastSessionType === "focused" ? "focused" : "general"); // Set appropriate session type
    router.push("/session");
    // Start same type of session (will use existing focusedStrategyId if it was focused)
    setTimeout(() => startSameTypeSession(), 100);
  };

  // Get strategy name for focused sessions
  const focusedStrategyName =
    focusedStrategyId && STRATEGY_DISPLAY_DETAILS[focusedStrategyId]
      ? STRATEGY_DISPLAY_DETAILS[focusedStrategyId].name
      : undefined;

  return (
    <SessionResults
      session={session}
      onBackToHome={handleBackToHome}
      onNewSession={handleNewSession}
      onSameTypeSession={handleSameTypeSession}
      lastSessionType={lastSessionType}
      focusedStrategyName={focusedStrategyName}
    />
  );
}
