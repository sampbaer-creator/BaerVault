import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoGoalsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/demo/accounts", "goals", await searchParams));
}
