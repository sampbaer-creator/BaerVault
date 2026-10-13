import type { Metadata } from "next";

export const metadata: Metadata = { title: "Demo household" };

import { DemoHousehold } from "@/components/demo/DemoHousehold";

export default function DemoHouseholdPage() {
  return <DemoHousehold />;
}
