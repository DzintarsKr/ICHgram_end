import express from "express";
import { getLikes, toggleLike } from "../controllers/likeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:postId", getLikes);
router.post("/:postId", toggleLike);

export default router;
