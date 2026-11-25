import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest, saveToken } from "@/lib/api";
import styles from "@/styles/auth.module.css";

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", fullName: "", username: "", password: "" });

  const register = useMutation({
    mutationFn: () => apiRequest("/auth/register", { method: "POST", json: form }),
    onSuccess: ({ token }) => {
      saveToken(token);
      queryClient.clear();
      navigate("/", { replace: true });
    },
  });

  function updateField(name) {
    return (event) => setForm((current) => ({ ...current, [name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    register.mutate();
  }

  return (<div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.card}>
          <h1 className={styles.brand}>
            <img src="/assets/images/ichgram-logo.webp" alt="ICHGRAM" width="190" height="107" className={styles.brandImage} />
          </h1>
          <p className={styles.subtitle}>Sign up to see photos and videos from your friends.</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={updateField("email")} required className={styles.input}/>
            <input placeholder="Full name" aria-label="Full name" value={form.fullName} onChange={updateField("fullName")} maxLength={100} className={styles.input}/>
            <input placeholder="Username" aria-label="Username" value={form.username} onChange={updateField("username")} pattern="[a-z0-9_]{3,30}" title="3-30 characters: a-z, 0-9 or underscore" required className={styles.input}/>
            <input type="password" placeholder="Password" aria-label="Password" value={form.password} onChange={updateField("password")} minLength={6} required className={styles.input}/>
            {register.error && <p role="alert" className={styles.error}>{register.error.message}</p>}
            <button type="submit" className={styles.submit} disabled={register.isPending}>
              {register.isPending ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
        <div className={styles.switchCard}>
          Have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>);
}
