import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function GoalsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/accounts", "goals", await searchParams));
}
