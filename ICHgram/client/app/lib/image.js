export async function imageFileToBlob(file, maxSide = 1080) {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not read the image"));
            el.src = objectUrl;
        });
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Canvas is not supported in this browser");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process the image"))), "image/jpeg", 0.85);
        });
    }
    finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export default imageFileToBlob;
