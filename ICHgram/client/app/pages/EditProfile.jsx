import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StatusMessage } from "@/components/common/StatusMessage";
import { Avatar } from "@/components/posts/Avatar";
import { apiRequest } from "@/lib/api";
import { imageFileToBlob } from "@/lib/image";
import styles from "@/styles/editProfile.module.css";

const MAX_FULL_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 300;
const MAX_WEBSITE_LENGTH = 200;

export default function EditProfile() {
  const { data: me, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiRequest("/users/me"),
  });

  if (isLoading) {
    return <StatusMessage>Loading profile...</StatusMessage>;
  }
  if (error) {
    return <StatusMessage tone="error">{error.message}</StatusMessage>;
  }

  return <EditProfileForm profile={me} />;
}

function EditProfileForm({ profile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.fullName);
  const [website, setWebsite] = useState(profile.website);
  const [bio, setBio] = useState(profile.bio);
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => () => avatarPreview && URL.revokeObjectURL(avatarPreview), [avatarPreview]);

  const updateProfile = useMutation({
    mutationFn: (formData) => apiRequest("/users/me", { method: "PATCH", formData }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate(`/profile/${profile.id}`);
    },
  });

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError("");
    try {
      const blob = await imageFileToBlob(file, 512);
      setAvatarBlob(blob);
      setAvatarPreview(URL.createObjectURL(blob));
    } catch (err) {
      setAvatarBlob(null);
      setFileError(err.message);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("website", website);
    formData.append("bio", bio);
    if (avatarBlob) {
      formData.append("profile_image", avatarBlob, "avatar.jpg");
    }
    updateProfile.mutate(formData);
  }

  return (<div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Edit profile</h1>

        <div className={styles.photoRow}>
          <Avatar src={avatarPreview || profile.avatar} name={profile.username} size="md"/>
          <div className={styles.photoInfo}>
            <span className={styles.photoName}>{profile.username}</span>
            {fullName && <span className={styles.photoSub}>{fullName}</span>}
          </div>
          <label className={styles.photoButton}>
            New photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.fileInput}/>
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-username" className={styles.label}>Username</label>
          <input id="edit-username" value={username} onChange={(event) => setUsername(event.target.value)} pattern="[a-z0-9_]{3,30}" required className={styles.input}/>
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-full-name" className={styles.label}>Full name</label>
          <input id="edit-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={MAX_FULL_NAME_LENGTH} className={styles.input}/>
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-website" className={styles.label}>Website</label>
          <input id="edit-website" value={website} onChange={(event) => setWebsite(event.target.value)} maxLength={MAX_WEBSITE_LENGTH} className={styles.input}/>
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-bio" className={styles.label}>About</label>
          <div className={styles.textareaWrap}>
            <textarea id="edit-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={MAX_BIO_LENGTH} rows={4} className={styles.textarea}/>
            <span className={styles.counter}>{bio.length} / {MAX_BIO_LENGTH}</span>
          </div>
        </div>

        {(fileError || updateProfile.error) && (<p role="alert" className={styles.error}>{fileError || updateProfile.error.message}</p>)}

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>);
}
