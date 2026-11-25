import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { PostGrid } from "@/components/posts/PostGrid";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/profile.module.css";

export default function Profile() {
  const { userId } = useParams();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiRequest(`/users/${userId}`),
  });
  const postsQuery = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => apiRequest(`/posts/user/${userId}`),
  });

  const followMutation = useMutation({
    mutationFn: (isFollowing) =>
      apiRequest(`/follows/${userId}`, { method: isFollowing ? "DELETE" : "POST" }),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  if (profileQuery.isLoading) {
    return <StatusMessage>Loading profile...</StatusMessage>;
  }
  if (profileQuery.error) {
    return <StatusMessage tone="error">{profileQuery.error.message}</StatusMessage>;
  }

  const profile = profileQuery.data;
  const posts = postsQuery.data ?? [];

  return (<div className={styles.page}>
      <header className={styles.header}>
        <Avatar src={profile.avatar} name={profile.username} size="lg"/>
        <div className={styles.info}>
          <div className={styles.topRow}>
            <h1 className={styles.username}>{profile.username}</h1>
            {profile.isMine ? (<Link to="/accounts/edit" className={styles.secondaryButton}>Edit profile</Link>) : (<>
                <button type="button" className={profile.isFollowing ? styles.secondaryButton : styles.primaryButton} disabled={followMutation.isPending} onClick={() => followMutation.mutate(profile.isFollowing)}>
                  {profile.isFollowing ? "Following" : "Follow"}
                </button>
                <Link to={`/messages/${profile.id}`} className={styles.secondaryButton}>Message</Link>
              </>)}
          </div>
          <ul className={styles.stats}>
            <li><strong>{profile.postsCount}</strong> posts</li>
            <li><strong>{profile.followersCount}</strong> followers</li>
            <li><strong>{profile.followingCount}</strong> following</li>
          </ul>
          {profile.fullName && <p className={styles.fullName}>{profile.fullName}</p>}
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        </div>
      </header>

      {postsQuery.isSuccess && posts.length === 0 && <StatusMessage>No posts yet.</StatusMessage>}
      {posts.length > 0 && <PostGrid posts={posts}/>}
    </div>);
}
