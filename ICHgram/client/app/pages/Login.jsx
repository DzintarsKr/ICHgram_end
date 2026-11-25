import "@fontsource/pacifico/400.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest, saveToken } from "@/lib/api";
import styles from "@/styles/auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () =>
      apiRequest("/auth/login", { method: "POST", json: { login: identifier, password } }),
    onSuccess: ({ token }) => {
      saveToken(token);
      queryClient.clear();
      navigate("/", { replace: true });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    loginMutation.mutate();
  }

  return (
    <div className={styles.page}>
      <img
        src="/assets/images/background.webp"
        alt=""
        aria-hidden="true"
        width="381"
        height="582"
        className={styles.phones}
      />

      <div className={styles.panel}>
        <div className={styles.card}>
          <h1 className={styles.brand}>
            <img src="/assets/images/ichgram-logo.webp" alt="ICHGRAM" width="190" height="107" className={styles.brandImage} />
          </h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username, or email"
              aria-label="Username, or email"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={styles.input}
            />
            {loginMutation.error && (
              <p role="alert" className={styles.error}>
                {loginMutation.error.message}
              </p>
            )}
            <button type="submit" className={styles.submit} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          <Link to="/reset" className={styles.forgot}>Forgot password?</Link>
        </div>

        <div className={styles.switchCard}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
