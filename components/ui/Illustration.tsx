import Image from "next/image";

export type IllustrationName = "home-empty" | "budget-empty" | "onboarding-household" | "onboarding-bank" | "onboarding-budget" | "landing-hero";

export function Illustration({ name, alt = "", width = 240, height = 160 }: { name: IllustrationName; alt?: string; width?: number; height?: number }) {
  return <Image src={`/illustrations/${name}.svg`} alt={alt} width={width} height={height} />;
}
