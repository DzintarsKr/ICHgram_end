import express from "express";
import {
  addComment,
  deleteComment,
  getComments,
} from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/post/:postId", getComments);
router.post("/post/:postId", addComment);
router.delete("/:id", deleteComment);

export default router;
