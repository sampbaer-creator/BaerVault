import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoCashFlowPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/demo/budget", "cash-flow", await searchParams));
}
