import { IconHeartFilled } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import styles from "./PostCard.module.css";

export function PostCard({ post }) {
    const queryClient = useQueryClient();
    const location = useLocation();
    const [commentText, setCommentText] = useState("");
    const likeLabel = post.likedByMe ? "Unlike" : "Like";
    const profilePath = `/profile/${post.authorId}`;

    const toggleLike = useMutation({
        mutationFn: () => apiRequest(`/likes/${post.id}`, { method: "POST" }),
        onSuccess: () => queryClient.invalidateQueries(),
    });

    const addComment = useMutation({
        mutationFn: (text) => apiRequest(`/comments/post/${post.id}`, { method: "POST", json: { text } }),
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries();
        },
    });

    function handleCommentSubmit(event) {
        event.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed)
            return;
        addComment.mutate(trimmed);
    }

    return (<article className={styles.card} data-node-id="1:3878">
      <header className={styles.header}>
        <Link to={profilePath} className={styles.avatarLink} data-node-id="1:3879">
          <span className={styles.avatarWrap}>
            <img src="/assets/images/avatar-ring.png" alt="" className={styles.avatarRing}/>
            <Avatar src={post.authorAvatar} name={post.authorUsername} size="feed"/>
          </span>
        </Link>
        <div className={styles.meta}>
          <Link to={profilePath} className={styles.username} data-node-id="1:3886">
            {post.authorUsername}
          </Link>
          <span className={styles.dot}>•</span>
          <time dateTime={post.createdAt} className={styles.time} data-node-id="1:3889">
            {formatRelativeTime(post.createdAt)}
          </time>
        </div>
      </header>

      <Link to={`/posts/${post.id}`} state={{ background: location }} className={styles.media} data-node-id="1:3894">
        <img src={post.image} alt={post.caption || `Post by ${post.authorUsername}`} loading="lazy" className={styles.image} data-node-id="1:3897"/>
      </Link>

      <div className={styles.details}>
        <div className={styles.actions} data-node-id="1:3899">
          <button type="button" aria-label={likeLabel} aria-pressed={post.likedByMe} disabled={toggleLike.isPending} onClick={() => toggleLike.mutate()} className={`${styles.iconButton} ${post.likedByMe ? styles.liked : ""}`} data-node-id="1:3900">
            {post.likedByMe ? <IconHeartFilled size={21}/> : <img src="/assets/icons/icon-like.svg" alt="" className={styles.icon}/>}
          </button>
          <Link to={`/posts/${post.id}`} state={{ background: location }} aria-label="Comments" className={styles.iconButton} data-node-id="1:3902">
            <img src="/assets/icons/icon-comment.svg" alt="" className={styles.icon}/>
          </Link>
        </div>

        <p className={styles.likes} data-node-id="1:3906">
          {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
        </p>

        {post.caption && (<p className={styles.caption} data-node-id="1:3910">
            <Link to={profilePath} className={styles.captionUsername}>{post.authorUsername}</Link>
            <span className={styles.captionText}>{post.caption}</span>
          </p>)}

        {post.commentCount > 0 && (<Link to={`/posts/${post.id}`} state={{ background: location }} className={styles.commentsLink} data-node-id="1:3916">
            View all comments ({post.commentCount})
          </Link>)}

        <form onSubmit={handleCommentSubmit} className={styles.commentForm} data-node-id="1:3917">
          <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add a comment..." aria-label="Add a comment" maxLength={1000} className={styles.commentInput}/>
        </form>
      </div>
    </article>);
}

export default PostCard;
