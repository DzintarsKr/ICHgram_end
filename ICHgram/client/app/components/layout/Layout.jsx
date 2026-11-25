import { Outlet } from "react-router";
import AppSidebar from "@/components/layout/AppSidebar";
import Footer from "@/components/layout/Footer";
import { useChatSocket } from "@/hooks/useChatSocket";
import styles from "./Layout.module.css";

export function Layout() {
  useChatSocket();

  return (
    <div className={styles.shell}>
      <AppSidebar />
      <main className={styles.main}>
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}

export default Layout;
