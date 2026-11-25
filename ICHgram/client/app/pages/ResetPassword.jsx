import { IconLock } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/auth.module.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const resetMutation = useMutation({
    mutationFn: () =>
      apiRequest("/auth/reset-password", { method: "POST", json: { token, password } }),
    onSuccess: () => setPassword(""),
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
          <h1 className={styles.resetTitle}>Choose a new password</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="password" placeholder="New password" aria-label="New password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required className={styles.input}/>
            {resetMutation.isSuccess && <p role="status" className={styles.info}>{resetMutation.data.message}</p>}
            {resetMutation.error && <p role="alert" className={styles.error}>{resetMutation.error.message}</p>}
            <button type="submit" className={styles.submit} disabled={resetMutation.isPending || resetMutation.isSuccess}>
              {resetMutation.isPending ? "Saving..." : "Save new password"}
            </button>
          </form>
        </div>
        <div className={styles.switchCard}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>);
}
