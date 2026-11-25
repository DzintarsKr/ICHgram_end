import styles from "./Avatar.module.css";
const SIZE_CLASS = {
    feed: styles.feed,
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
};
export function Avatar({ src, name, size = "md" }) {
    const className = `${styles.avatar} ${SIZE_CLASS[size]}`;
    if (src) {
        return <img src={src} alt={name} className={`${className} ${styles.image}`}/>;
    }
    return (<div className={`${className} ${styles.fallback}`} aria-label={name}>
      {name.charAt(0)}
    </div>);
}

export default Avatar;
