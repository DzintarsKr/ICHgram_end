import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import styles from "@/styles/search.module.css";

export default function Search() {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: users, isFetching, error } = useQuery({
    queryKey: ["search", query],
    queryFn: () => apiRequest(`/search/users?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  });

  return (<aside className={styles.panel}>
      <h1 className={styles.title}>Search</h1>
      <input type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search" aria-label="Search users" className={styles.input} autoFocus/>

      {!query && <StatusMessage>Start typing to find people.</StatusMessage>}
      {query && isFetching && !users && <StatusMessage>Searching...</StatusMessage>}
      {error && <StatusMessage tone="error">Search failed. Please try again.</StatusMessage>}
      {users?.length === 0 && <StatusMessage>No users match “{query}”.</StatusMessage>}

      {users?.length > 0 && (<ul className={styles.results}>
          {users.map((user) => (<li key={user.id}>
              <Link to={`/profile/${user.id}`} className={styles.result}>
                <Avatar src={user.avatar} name={user.username} size="md"/>
                <span className={styles.resultText}>
                  <span className={styles.username}>{user.username}</span>
                  {user.fullName && <span className={styles.fullName}>{user.fullName}</span>}
                </span>
              </Link>
            </li>))}
        </ul>)}
    </aside>);
}
