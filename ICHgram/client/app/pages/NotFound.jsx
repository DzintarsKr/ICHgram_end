import { Link } from "react-router";
import styles from "@/styles/notFound.module.css";

export default function NotFound() {
  return (<div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
        <p className={styles.text}>The link you followed may be broken, or the page may have been removed.</p>
        <Link to="/" className={styles.link}>Go back to home</Link>
      </div>
    </div>);
}
