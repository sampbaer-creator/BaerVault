import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import styles from "../../auth.module.css";
import { Illustration } from "@/components/ui/Illustration";

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.brand} href="/">BaerVault</Link>
      <div className={styles.authCard}>
        <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" appearance={{ variables: { colorPrimary: "var(--app-accent)", colorBackground: "var(--app-surface)", colorForeground: "var(--app-text-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-system)" }, options: { socialButtonsPlacement: "top", socialButtonsVariant: "blockButton" } }} />
      </div>
      <p className={styles.footer}>Welcome back to your household vault.</p>
      <aside className={styles.illustration} aria-hidden="true"><Illustration name="onboarding-household" width={420} height={280} /></aside>
    </main>
  );
}
