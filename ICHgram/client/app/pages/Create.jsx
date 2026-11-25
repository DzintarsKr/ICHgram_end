import { IconPhoto, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "@/lib/api";
import { imageFileToBlob } from "@/lib/image";
import styles from "@/styles/create.module.css";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_CAPTION_LENGTH = 2200;

export default function Create() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [fileError, setFileError] = useState("");
  const [isReading, setIsReading] = useState(false);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const createPost = useMutation({
    mutationFn: (formData) => apiRequest("/posts", { method: "POST", formData }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/");
    },
  });

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError("");
    setIsReading(true);
    try {
      const blob = await imageFileToBlob(file);
      if (blob.size > MAX_IMAGE_BYTES) {
        setPhoto(null);
        setFileError("This image is too large. Try a smaller photo.");
        return;
      }
      setPhoto(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      setPhoto(null);
      setFileError(err.message);
    } finally {
      setIsReading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", photo, "photo.jpg");
    formData.append("caption", caption);
    createPost.mutate(formData);
  }

  const canSubmit = Boolean(photo) && !isReading && !createPost.isPending;

  return (<div className={styles.overlay}>
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create new post</h1>
          <button type="submit" disabled={!canSubmit} className={styles.submit}>
            {createPost.isPending ? "Sharing..." : "Share"}
          </button>
          <button type="button" aria-label="Close" className={styles.close} onClick={() => navigate("/")}>
            <IconX size={20}/>
          </button>
        </header>

        <div className={styles.body}>
          <label className={styles.picker}>
            {previewUrl ? (<img src={previewUrl} alt="Selected preview" className={styles.preview}/>) : (<span className={styles.placeholder}>
                <IconPhoto size={96} stroke={0.8} aria-hidden="true"/>
                <span className={styles.placeholderText}>
                  {isReading ? "Processing photo..." : "Drag photos here"}
                </span>
                <span className={styles.selectButton}>Select from computer</span>
              </span>)}
            <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput}/>
          </label>

          <div className={styles.side}>
            <label className={styles.field}>
              <span className={styles.label}>Caption</span>
              <textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={MAX_CAPTION_LENGTH} rows={8} placeholder="Write a caption..." className={styles.textarea}/>
            </label>
            {fileError && <p role="alert" className={styles.error}>{fileError}</p>}
            {createPost.error && (<p role="alert" className={styles.error}>{createPost.error.message}</p>)}
          </div>
        </div>
      </form>
    </div>);
}
