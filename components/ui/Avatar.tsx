import Image from "next/image";
import styles from "./Avatar.module.css";

export function Avatar({ name, imageUrl, size = 40 }: { name: string; imageUrl?: string | null; size?: number }) {
  return <span className={styles.avatar} style={{ width: size, height: size }} role="img" aria-label={name}>{imageUrl ? <Image src={imageUrl} alt="" width={size} height={size} unoptimized /> : name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</span>;
}
