import { Outlet } from "react-router";
import Home from "@/pages/Home";
import styles from "./FeedBackdrop.module.css";

export function FeedBackdrop() {
  return (<div className={styles.backdrop}>
      <Home />
      <div className={styles.dim} aria-hidden="true" />
      <Outlet />
    </div>);
}

export default FeedBackdrop;
