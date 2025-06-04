"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { Session } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionResults } from "@/components/session/session-results";

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
    router.push("/");
  };

  const handleNewSession = () => {
    router.push("/session");
  };

  return (
    <SessionResults
      session={session}
      onBackToHome={handleBackToHome}
      onNewSession={handleNewSession}
    />
  );
}
