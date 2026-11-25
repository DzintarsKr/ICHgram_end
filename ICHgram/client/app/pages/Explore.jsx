import { useQuery } from "@tanstack/react-query";
import { StatusMessage } from "@/components/common/StatusMessage";
import { PostGrid } from "@/components/posts/PostGrid";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/explore.module.css";

export default function Explore() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["explore"],
    queryFn: () => apiRequest("/search/explore"),
    staleTime: Infinity,
  });

  return (<div className={styles.page}>
      {isLoading && <StatusMessage>Loading posts...</StatusMessage>}
      {error && <StatusMessage tone="error">Could not load posts.</StatusMessage>}
      {posts?.length === 0 && <StatusMessage>No posts to explore yet.</StatusMessage>}
      {posts?.length > 0 && <PostGrid posts={posts} mosaic/>}
    </div>);
}
