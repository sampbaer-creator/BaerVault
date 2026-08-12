import { DemoShell } from "@/components/demo/DemoShell";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
