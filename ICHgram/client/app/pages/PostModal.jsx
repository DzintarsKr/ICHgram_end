import { IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import PostDetail from "@/pages/PostDetail";
import styles from "@/styles/post.module.css";

export default function PostModal() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") navigate(-1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (<div className={styles.overlay} onClick={() => navigate(-1)}>
      <button type="button" aria-label="Close" className={styles.close} onClick={() => navigate(-1)}>
        <IconX size={28}/>
      </button>
      <div className={styles.dialog} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <PostDetail isModal/>
      </div>
    </div>);
}
