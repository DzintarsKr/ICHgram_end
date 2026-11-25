import express from "express";
import {
  createPost,
  deletePost,
  getFeed,
  getPost,
  getUserPosts,
  updatePost,
} from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import imageUpload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFeed);
router.post("/", imageUpload.single("image"), createPost);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);
router.patch("/:id", imageUpload.single("image"), updatePost);
router.delete("/:id", deletePost);

export default router;
