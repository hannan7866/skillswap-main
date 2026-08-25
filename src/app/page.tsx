import { LandingView } from "@/components/landing/landing-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkillSwap - Exchange Skills, Bank Pure Time",
  description: "Join SkillSwap, the premier peer-to-peer time banking community. Share your expertise, earn time credits, and learn any skill for free without money.",
};

export default function LandingPage() {
  return <LandingView />;
}

