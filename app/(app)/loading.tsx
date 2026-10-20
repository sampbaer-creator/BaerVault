import { CardSkeleton, ListRowSkeleton } from "@/components/ui/Skeletons";

export default function AppLoading() {
  return <div aria-label="Loading household workspace" aria-busy="true" style={{ display: "grid", gap: "1rem", padding: "var(--space-page)" }}><CardSkeleton /><CardSkeleton /><ListRowSkeleton /><ListRowSkeleton /><ListRowSkeleton /></div>;
}
