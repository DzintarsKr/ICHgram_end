import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import styles from "@/styles/notifications.module.css";

const MESSAGES = {
  like: "liked your photo.",
  comment: "commented on your photo.",
  follow: "started following you.",
  post: "shared a new post.",
};

export default function Notifications() {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest("/notifications"),
  });

  return (<aside className={styles.panel}>
      <h1 className={styles.title}>Notifications</h1>
      {isLoading && <StatusMessage>Loading notifications...</StatusMessage>}
      {error && <StatusMessage tone="error">Could not load notifications.</StatusMessage>}
      {notifications?.length === 0 && <StatusMessage>No notifications yet.</StatusMessage>}

      <ul className={styles.list}>
        {notifications?.map((notification) => (<li key={notification.id} className={styles.item}>
            <Link to={`/profile/${notification.sender.id}`}>
              <Avatar src={notification.sender.avatar} name={notification.sender.username} size="md"/>
            </Link>
            <p className={styles.text}>
              <Link to={`/profile/${notification.sender.id}`} className={styles.username}>
                {notification.sender.username}
              </Link>{" "}
              {MESSAGES[notification.type]}{" "}
              <time dateTime={notification.createdAt} className={styles.time}>
                {formatRelativeTime(notification.createdAt)}
              </time>
            </p>
            {notification.postImage && (<Link to={`/posts/${notification.postId}`} className={styles.thumb}>
                <img src={notification.postImage} alt="" className={styles.thumbImage}/>
              </Link>)}
          </li>))}
      </ul>
    </aside>);
}
