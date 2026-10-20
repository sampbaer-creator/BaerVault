import { CardSkeleton, ListRowSkeleton } from "@/components/ui/Skeletons";

export default function DemoLoading() {
  return <div aria-label="Loading demo" aria-busy="true" style={{ display: "grid", gap: "1rem", padding: "var(--space-page)" }}><CardSkeleton /><CardSkeleton /><ListRowSkeleton /><ListRowSkeleton /></div>;
}
