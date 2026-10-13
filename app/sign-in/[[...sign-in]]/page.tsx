import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import styles from "../../auth.module.css";

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.brand} href="/">BearVault</Link>
      <div className={styles.authCard}>
        <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      </div>
      <p className={styles.footer}>Welcome back to your household vault.</p>
    </main>
  );
}
