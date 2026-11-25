import express from "express";
import {
  getConversations,
  getThread,
} from "../controllers/messageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/conversations", getConversations);
router.get("/:userId", getThread);

export default router;
