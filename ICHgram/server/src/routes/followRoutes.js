import express from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../controllers/followController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);
router.post("/:userId", followUser);
router.delete("/:userId", unfollowUser);

export default router;
