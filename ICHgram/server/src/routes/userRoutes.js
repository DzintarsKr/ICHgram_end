import express from "express";
import {
  getMe,
  getUserById,
  updateMe,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import imageUpload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getMe);
router.patch("/me", imageUpload.single("profile_image"), updateMe);
router.get("/:userId", getUserById);

export default router;
