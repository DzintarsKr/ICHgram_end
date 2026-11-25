import { IconLock } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/auth.module.css";

export default function Reset() {
  const [identifier, setIdentifier] = useState("");

  const resetMutation = useMutation({
    mutationFn: () =>
      apiRequest("/auth/reset-request", { method: "POST", json: { identifier } }),
  });

  function handleSubmit(event) {
    event.preventDefault();
    resetMutation.mutate();
  }

  return (<div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.lockCircle} aria-hidden="true">
            <IconLock size={48} stroke={1.2}/>
          </div>
          <h1 className={styles.resetTitle}>Trouble logging in?</h1>
          <p className={styles.resetText}>
            Enter your email, username and we&apos;ll send you a link to get back into your account.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="text" placeholder="Email or username" aria-label="Email or username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required className={styles.input}/>
            {resetMutation.isSuccess && <p role="status" className={styles.info}>{resetMutation.data.message}</p>}
            {resetMutation.error && <p role="alert" className={styles.error}>{resetMutation.error.message}</p>}
            <button type="submit" className={styles.submit} disabled={!identifier.trim() || resetMutation.isPending}>
              {resetMutation.isPending ? "Sending..." : "Send login link"}
            </button>
          </form>
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          <Link to="/register" className={styles.createLink}>Create new account</Link>
        </div>
        <div className={styles.switchCard}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>);
}
