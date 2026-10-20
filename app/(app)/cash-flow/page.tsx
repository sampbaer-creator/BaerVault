import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function CashFlowPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/budget", "cash-flow", await searchParams));
}
