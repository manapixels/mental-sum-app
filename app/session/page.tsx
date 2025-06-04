import type { Metadata } from "next";
import { SessionInterface } from "@/components/session/session-interface";

export const metadata: Metadata = {
  title: "Practice Session - ne.ko",
  description: "Practice mental math with adaptive problem generation.",
};

export default function SessionPage() {
  return <SessionInterface />;
}
