import { Skeleton } from "@mantine/core";
import styles from "./Skeletons.module.css";

export function CardSkeleton() { return <section className={styles.card} aria-label="Loading card"><Skeleton height={14} width="35%" /><Skeleton height={34} width="60%" /><Skeleton height={8} /></section>; }
export function ListRowSkeleton() { return <div className={styles.row} aria-label="Loading row"><Skeleton circle height={40} /><div><Skeleton height={13} width="10rem" /><Skeleton height={10} width="7rem" /></div><Skeleton height={14} width="4rem" /></div>; }
