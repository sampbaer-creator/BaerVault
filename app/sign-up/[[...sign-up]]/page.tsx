import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import styles from "../../auth.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.page}>
      <Link className={styles.brand} href="/">BearVault</Link>
      <div className={styles.authCard}>
        <p className={styles.step}>Step 1 of 2</p>
        <SignUp forceRedirectUrl="/household/setup" signInUrl="/sign-in" />
      </div>
      <p className={styles.footer}>Secure household finance, built for real life.</p>
    </main>
  );
}
