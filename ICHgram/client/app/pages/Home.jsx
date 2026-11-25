import { useQuery } from "@tanstack/react-query";
import { StatusMessage } from "@/components/common/StatusMessage";
import { PostCard } from "@/components/posts/PostCard";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/home.module.css";

export default function Home() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiRequest("/posts"),
  });

  return (<div className={styles.page}>
      {isLoading && <StatusMessage>Loading posts...</StatusMessage>}
      {error && <StatusMessage tone="error">Could not load the feed.</StatusMessage>}
      {posts?.length === 0 && (<StatusMessage>No posts yet. Share your first photo from Create.</StatusMessage>)}
      <div className={styles.feed}>
        {posts?.map((post) => (<PostCard key={post.id} post={post}/>))}
      </div>
      {posts?.length > 0 && (<div className={styles.footer} data-node-id="1:3874">
          <img src="/assets/images/illo-confirm-refresh-light.png" alt="" className={styles.footerIcon} data-node-id="1:3875"/>
          <p className={styles.footerTitle} data-node-id="1:3876">You've seen all the updates</p>
          <p className={styles.footerText} data-node-id="1:3877">You have viewed all new publications</p>
        </div>)}
    </div>);
}
