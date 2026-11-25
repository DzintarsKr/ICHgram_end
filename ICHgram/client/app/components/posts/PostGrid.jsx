import { Link, useLocation } from "react-router";
import styles from "./PostGrid.module.css";

const MOSAIC_LARGE_EVERY = 6;

export function PostGrid({ posts, mosaic = false }) {
    const location = useLocation();
    return (<div className={`${styles.grid} ${mosaic ? styles.mosaic : ""}`}>
      {posts.map((post, index) => (<Link key={post.id} to={`/posts/${post.id}`} state={{ background: location }} className={`${styles.tile} ${mosaic && index % MOSAIC_LARGE_EVERY === 0 ? styles.large : ""}`} aria-label={post.caption || `Post by ${post.authorUsername}`}>
          <img src={post.image} alt="" loading="lazy" className={styles.image}/>
          <span className={styles.overlay}>
            {post.likeCount} likes · {post.commentCount} comments
          </span>
        </Link>))}
    </div>);
}

export default PostGrid;
