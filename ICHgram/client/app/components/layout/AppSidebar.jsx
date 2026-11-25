import "@fontsource/pacifico/400.css";
import { IconBell, IconCompass, IconHome, IconLogout, IconMessageCircle, IconSearch, IconSquarePlus, IconUser, } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router";
import { apiRequest, clearToken } from "@/lib/api";
import styles from "./AppSidebar.module.css";

function NavItem({ to, label, icon: Icon, end }) {
    return (<NavLink to={to} end={end} aria-label={label} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
      <Icon size={24} stroke={1.8}/>
      <span className={styles.label}>{label}</span>
    </NavLink>);
}

export function AppSidebar() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiRequest("/users/me") });

    function handleLogout() {
        clearToken();
        queryClient.clear();
        navigate("/login", { replace: true });
    }

    return (<aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/assets/images/ichgram-logo.webp" alt="ICHGRAM" width="120" height="68" className={styles.brandImage} />
      </div>
      <NavItem to="/" label="Home" icon={IconHome} end/>
      <NavItem to="/search" label="Search" icon={IconSearch}/>
      <NavItem to="/explore" label="Explore" icon={IconCompass}/>
      <NavItem to="/messages" label="Messages" icon={IconMessageCircle}/>
      <NavItem to="/notifications" label="Notifications" icon={IconBell}/>
      <NavItem to="/create" label="Create" icon={IconSquarePlus}/>
      {me && (<NavItem to={`/profile/${me.id}`} label="Profile" icon={IconUser}/>)}
      <button type="button" className={`${styles.item} ${styles.logout}`} onClick={handleLogout}>
        <IconLogout size={24} stroke={1.8}/>
        <span className={styles.label}>Log out</span>
      </button>
    </aside>);
}

export default AppSidebar;
