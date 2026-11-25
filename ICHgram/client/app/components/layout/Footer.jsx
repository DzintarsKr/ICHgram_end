import { Link } from "react-router";
import styles from "./Footer.module.css";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Search", to: "/search" },
  { label: "Explore", to: "/explore" },
  { label: "Messages", to: "/messages" },
  { label: "Notifications", to: "/notifications" },
  { label: "Create", to: "/create" },
];

export function Footer() {
  return (<footer className={styles.footer}>
      <nav aria-label="Footer" className={styles.links}>
        {LINKS.map((link) => (<Link key={link.to} to={link.to} className={styles.link}>{link.label}</Link>))}
      </nav>
      <p className={styles.copyright}>© 2024 ICHgram</p>
    </footer>);
}

export default Footer;
