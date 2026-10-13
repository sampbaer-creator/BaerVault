import type { Metadata } from "next";

export const metadata: Metadata = { title: "Demo goals" };

import { DemoGoals } from "@/components/demo/DemoGoals";
export default function DemoGoalsPage() { return <DemoGoals />; }
