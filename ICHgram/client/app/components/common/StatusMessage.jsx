import styles from "./StatusMessage.module.css";
export function StatusMessage({ children, tone = "muted" }) {
    return (<p role={tone === "error" ? "alert" : undefined} className={`${styles.message} ${styles[tone]}`}>
      {children}
    </p>);
}

export default StatusMessage;
