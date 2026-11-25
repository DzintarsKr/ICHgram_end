import express from "express";
import {
  getExplorePosts,
  searchUsers,
} from "../controllers/searchController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", searchUsers);
router.get("/explore", getExplorePosts);

export default router;
