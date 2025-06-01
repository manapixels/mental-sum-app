"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/contexts/session-context";
import { AlertTriangle, CircleSlash } from "lucide-react";

export function SessionControls() {
  const router = useRouter();
  const { endSession } = useSession();
  const [showEndDialog, setShowEndDialog] = useState(false);

  const handleEndSession = () => {
    endSession();
    router.push("/");
  };

  return (
    <>
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowEndDialog(true)}
          className="flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <CircleSlash className="h-4 w-4" />
          End Session
        </Button>
      </div>

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              End Session?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to end this session? Your progress will be
              saved, but you won&apos;t be able to continue with the remaining
              problems.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndSession}
              className="flex-1"
            >
              End Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
