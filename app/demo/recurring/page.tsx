import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoRecurringPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/demo/transactions", "recurring", await searchParams));
}
