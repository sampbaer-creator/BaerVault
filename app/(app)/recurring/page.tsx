import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function RecurringPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/transactions", "recurring", await searchParams));
}
