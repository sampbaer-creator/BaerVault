import { redirect } from "next/navigation";
import { sectionHref, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function InvestmentsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  redirect(sectionHref("/accounts", "investments", await searchParams));
}
