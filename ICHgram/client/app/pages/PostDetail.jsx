import { IconDots, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { imageFileToBlob } from "@/lib/image";
import styles from "@/styles/post.module.css";

const MAX_COMMENT_LENGTH = 1000;
const MAX_CAPTION_LENGTH = 2200;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export default function PostDetail({ isModal = false }) {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: () => apiRequest(`/posts/${id}`),
  });
  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => apiRequest(`/comments/post/${id}`),
  });

  if (postQuery.isLoading) {
    return <StatusMessage>Loading post...</StatusMessage>;
  }
  if (postQuery.error) {
    return <StatusMessage tone="error">{postQuery.error.message}</StatusMessage>;
  }

  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];

  return (<article className={`${styles.card} ${isModal ? styles.modalCard : styles.pageCard}`}>
      <div className={styles.media}>
        <img src={post.image} alt={post.caption || `Post by ${post.authorUsername}`} className={styles.image}/>
      </div>
      <div className={styles.side}>
        <header className={styles.header}>
          <Link to={`/profile/${post.authorId}`} className={styles.author}>
            <Avatar src={post.authorAvatar} name={post.authorUsername} size="sm"/>
            <span className={styles.username}>{post.authorUsername}</span>
          </Link>
          {post.isMine && <OwnerMenu post={post} onEdit={() => setIsEditing(true)} />}
        </header>

        <div className={styles.comments}>
          {post.caption && (<div className={styles.comment}>
              <Avatar src={post.authorAvatar} name={post.authorUsername} size="sm"/>
              <div className={styles.commentBody}>
                <p className={styles.commentText}>
                  <span className={styles.username}>{post.authorUsername}</span> {post.caption}
                </p>
                <span className={styles.time}>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>)}
          {comments.map((comment) => (<CommentItem key={comment.id} comment={comment}/>))}
          {commentsQuery.isSuccess && comments.length === 0 && <StatusMessage>No comments yet.</StatusMessage>}
        </div>

        {isEditing && <EditPostForm post={post} onDone={() => setIsEditing(false)} />}

        <div className={styles.footer}>
          <div className={styles.actions}>
            <LikeButton post={post}/>
          </div>
          <p className={styles.likes}>
            {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
          </p>
          <time dateTime={post.createdAt} className={styles.time}>{formatRelativeTime(post.createdAt)}</time>
        </div>

        <AddCommentForm postId={post.id}/>
      </div>
    </article>);
}

function LikeButton({ post }) {
  const queryClient = useQueryClient();
  const toggleLike = useMutation({
    mutationFn: () => apiRequest(`/likes/${post.id}`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (<button type="button" aria-label={post.likedByMe ? "Unlike" : "Like"} aria-pressed={post.likedByMe} disabled={toggleLike.isPending} onClick={() => toggleLike.mutate()} className={`${styles.likeButton} ${post.likedByMe ? styles.liked : ""}`}>
      {post.likedByMe ? <IconHeartFilled size={24}/> : <IconHeart size={24}/>}
    </button>);
}

function CommentItem({ comment }) {
  const queryClient = useQueryClient();
  const deleteComment = useMutation({
    mutationFn: () => apiRequest(`/comments/${comment.id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (<div className={styles.comment}>
      <Avatar src={comment.authorAvatar} name={comment.authorUsername} size="sm"/>
      <div className={styles.commentBody}>
        <p className={styles.commentText}>
          <Link to={`/profile/${comment.authorId}`} className={styles.username}>
            {comment.authorUsername}
          </Link>{" "}
          {comment.text}
        </p>
        <span className={styles.time}>{formatRelativeTime(comment.createdAt)}</span>
      </div>
      {comment.isMine && (<button type="button" className={styles.textButton} disabled={deleteComment.isPending} onClick={() => deleteComment.mutate()}>
          Delete
        </button>)}
    </div>);
}

function AddCommentForm({ postId }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const addComment = useMutation({
    mutationFn: (value) => apiRequest(`/comments/post/${postId}`, { method: "POST", json: { text: value } }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries();
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment.mutate(trimmed);
  }

  return (<form className={styles.commentForm} onSubmit={handleSubmit}>
      <input value={text} onChange={(event) => setText(event.target.value)} maxLength={MAX_COMMENT_LENGTH} placeholder="Add a comment..." aria-label="Add a comment" className={styles.commentInput}/>
      <button type="submit" className={styles.textButton} disabled={!text.trim() || addComment.isPending}>
        Post
      </button>
    </form>);
}

function OwnerMenu({ post, onEdit }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const deletePost = useMutation({
    mutationFn: () => apiRequest(`/posts/${post.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/");
    },
  });

  function handleEdit() {
    setIsOpen(false);
    onEdit();
  }

  function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    deletePost.mutate();
  }

  return (<div className={styles.menuWrap}>
      <button type="button" aria-label="Post options" aria-expanded={isOpen} className={styles.iconButton} onClick={() => setIsOpen((value) => !value)}>
        <IconDots size={24}/>
      </button>
      {isOpen && (<div role="menu" className={styles.menu}>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={handleEdit}>Edit post</button>
          <button type="button" role="menuitem" className={`${styles.menuItem} ${styles.danger}`} disabled={deletePost.isPending} onClick={handleDelete}>Delete post</button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={() => setIsOpen(false)}>Cancel</button>
        </div>)}
      {deletePost.error && <p role="alert" className={styles.error}>{deletePost.error.message}</p>}
    </div>);
}

function EditPostForm({ post, onDone }) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState(post.caption);
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [isReading, setIsReading] = useState(false);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const updatePost = useMutation({
    mutationFn: (formData) => apiRequest(`/posts/${post.id}`, { method: "PATCH", formData }),
    onSuccess: () => {
      onDone();
      queryClient.invalidateQueries();
    },
  });

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError("");
    setIsReading(true);
    try {
      const blob = await imageFileToBlob(file);
      if (blob.size > MAX_IMAGE_BYTES) {
        setFileError("This image is too large. Try a smaller photo.");
        return;
      }
      setPhoto(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      setFileError(err.message);
    } finally {
      setIsReading(false);
    }
  }

  function handleSave(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    if (photo) formData.append("image", photo, "photo.jpg");
    updatePost.mutate(formData);
  }

  return (<form onSubmit={handleSave} className={styles.editForm}>
      <div className={styles.editPhoto}>
        <img src={previewUrl || post.image} alt="Post image preview" className={styles.editPreview}/>
        <label className={`${styles.secondaryButton} ${styles.fileButton}`}>
          {isReading ? "Processing..." : "Change photo"}
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isReading} className={styles.fileInput}/>
        </label>
      </div>
      <textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={MAX_CAPTION_LENGTH} rows={3} aria-label="Caption" className={styles.textarea}/>
      <div className={styles.ownerButtons}>
        <button type="button" className={styles.secondaryButton} onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className={styles.primaryButton} disabled={isReading || updatePost.isPending}>
          Save
        </button>
      </div>
      {fileError && <p role="alert" className={styles.error}>{fileError}</p>}
      {updatePost.error && <p role="alert" className={styles.error}>{updatePost.error.message}</p>}
    </form>);
}
