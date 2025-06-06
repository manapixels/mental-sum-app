import type { Metadata } from "next";
import { SessionContent } from "@/components/session/session-content";

export const metadata: Metadata = {
  title: "Practice Session - neko+",
  description: "Practice mental math with adaptive problem generation.",
};

export default function SessionPage() {
  return <SessionContent />;
}
