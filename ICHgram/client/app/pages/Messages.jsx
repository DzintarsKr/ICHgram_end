import { IconChevronLeft, IconMessageCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { connectSocket } from "@/lib/socket";
import styles from "@/styles/messages.module.css";

const MAX_MESSAGE_LENGTH = 1000;
const SEND_TIMEOUT_MS = 5000;

export default function Messages() {
  const { userId } = useParams();

  return (<div className={`${styles.page} ${userId ? styles.threadOpen : ""}`}>
      <Inbox activeUserId={userId} />
      {userId ? <Thread key={userId} userId={userId} /> : <EmptyThread />}
    </div>);
}

function Inbox({ activeUserId }) {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiRequest("/users/me") });
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiRequest("/messages/conversations"),
  });
  const searchQuery = useQuery({
    queryKey: ["search", query],
    queryFn: () => apiRequest(`/search/users?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  });

  const conversations = conversationsQuery.data ?? [];
  const searchResults = (searchQuery.data ?? []).filter((user) => user.id !== me?.id);

  return (<section className={styles.inbox}>
      <header className={styles.inboxHeader}>
        <h1 className={styles.title}>{me?.username ?? "Messages"}</h1>
      </header>
      <div className={styles.searchWrap}>
        <input type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search people" aria-label="Search people to message" className={styles.searchInput}/>
      </div>

      {query ? (<>
          {searchQuery.isFetching && !searchQuery.data && <StatusMessage>Searching...</StatusMessage>}
          {searchQuery.error && <StatusMessage tone="error">Search failed. Please try again.</StatusMessage>}
          {searchQuery.isSuccess && searchResults.length === 0 && <StatusMessage>No users match “{query}”.</StatusMessage>}
          <ul className={styles.list}>
            {searchResults.map((user) => (<li key={user.id}>
                <Link to={`/messages/${user.id}`} onClick={() => setTerm("")} className={styles.item}>
                  <Avatar src={user.avatar} name={user.username} size="md"/>
                  <span className={styles.itemText}>
                    <span className={styles.username}>{user.username}</span>
                    {user.fullName && <span className={styles.preview}>{user.fullName}</span>}
                  </span>
                </Link>
              </li>))}
          </ul>
        </>) : (<>
          {conversationsQuery.isLoading && <StatusMessage>Loading conversations...</StatusMessage>}
          {conversationsQuery.error && <StatusMessage tone="error">{conversationsQuery.error.message}</StatusMessage>}
          {conversationsQuery.isSuccess && conversations.length === 0 && (<p className={styles.empty}>No conversations yet. Search for someone to start one.</p>)}
          <ul className={styles.list}>
            {conversations.map(({ user, lastMessage }) => (<li key={user.id}>
                <Link to={`/messages/${user.id}`} className={`${styles.item} ${user.id === activeUserId ? styles.itemActive : ""}`}>
                  <Avatar src={user.avatar} name={user.username} size="md"/>
                  <span className={styles.itemText}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.preview}>{lastMessage.isMine ? `You: ${lastMessage.text}` : lastMessage.text}</span>
                  </span>
                  <time dateTime={lastMessage.createdAt} className={styles.time}>{formatRelativeTime(lastMessage.createdAt)}</time>
                </Link>
              </li>))}
          </ul>
        </>)}
    </section>);
}

function Thread({ userId }) {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiRequest("/users/me") });
  const profileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiRequest(`/users/${userId}`),
  });
  const threadQuery = useQuery({
    queryKey: ["thread", userId],
    queryFn: () => apiRequest(`/messages/${userId}`),
  });
  const listRef = useRef(null);
  const messages = threadQuery.data ?? [];

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const profile = profileQuery.data;

  return (<section className={styles.conversation}>
      <header className={styles.threadHeader}>
        <Link to="/messages" aria-label="Back to messages" className={styles.backLink}>
          <IconChevronLeft size={24}/>
        </Link>
        {profile && (<Link to={`/profile/${profile.id}`} className={styles.threadUser}>
            <Avatar src={profile.avatar} name={profile.username} size="sm"/>
            <span className={styles.username}>{profile.username}</span>
          </Link>)}
      </header>

      <div ref={listRef} className={styles.messages}>
        {profile && (<div className={styles.intro}>
            <Avatar src={profile.avatar} name={profile.username} size="lg"/>
            <p className={styles.introName}>{profile.username}</p>
            {profile.fullName && <p className={styles.introSub}>{profile.fullName}</p>}
            <Link to={`/profile/${profile.id}`} className={styles.viewProfile}>View profile</Link>
          </div>)}
        {threadQuery.isLoading && <StatusMessage>Loading messages...</StatusMessage>}
        {threadQuery.error && <StatusMessage tone="error">{threadQuery.error.message}</StatusMessage>}
        {threadQuery.isSuccess && messages.length === 0 && <StatusMessage>No messages yet. Say hello!</StatusMessage>}
        {messages.length > 0 && (<time dateTime={messages[0].createdAt} className={styles.dateDivider}>{formatThreadDate(messages[0].createdAt)}</time>)}
        {messages.map((message) => {
          const author = message.isMine ? me : profile;
          const bubble = <p className={styles.bubble} title={new Date(message.createdAt).toLocaleString()}>{message.text}</p>;
          return (<div key={message.id} className={`${styles.bubbleRow} ${message.isMine ? styles.mine : ""}`}>
              {!message.isMine && author && <Avatar src={author.avatar} name={author.username} size="sm"/>}
              {bubble}
              {message.isMine && author && <Avatar src={author.avatar} name={author.username} size="sm"/>}
            </div>);
        })}
      </div>

      <Composer userId={userId} />
    </section>);
}

function Composer({ userId }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setSendError("");
    connectSocket()
      .timeout(SEND_TIMEOUT_MS)
      .emit("message:send", { recipientId: userId, text: trimmed }, (error, response) => {
        setIsSending(false);
        if (error) {
          setSendError("Message could not be sent. Check your connection and try again.");
          return;
        }
        if (!response.ok) {
          setSendError(response.message);
          return;
        }
        setText("");
      });
  }

  return (<form className={styles.composer} onSubmit={handleSubmit}>
      <input value={text} onChange={(event) => setText(event.target.value)} maxLength={MAX_MESSAGE_LENGTH} placeholder="Write message" aria-label="Message" className={styles.composerInput}/>
      {text.trim() && (<button type="submit" className={styles.sendButton} disabled={isSending}>
          Send
        </button>)}
      {sendError && <p role="alert" className={styles.error}>{sendError}</p>}
    </form>);
}

function formatThreadDate(value) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyThread() {
  return (<section className={styles.emptyPane}>
      <div className={styles.emptyState}>
        <span className={styles.iconCircle} aria-hidden="true">
          <IconMessageCircle size={48} stroke={1.2}/>
        </span>
        <h2 className={styles.emptyTitle}>Your messages</h2>
        <p className={styles.emptyText}>Select a conversation or search for someone to message.</p>
      </div>
    </section>);
}
