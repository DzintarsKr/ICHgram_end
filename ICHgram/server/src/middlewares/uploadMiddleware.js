import multer from "multer";
import HttpError from "../utils/httpError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 3 * 1024 * 1024;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(
      new HttpError(400, "Only JPEG, PNG, GIF or WebP images are allowed"),
    );
  },
});

export default imageUpload;
