import Follow from "../models/followModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import { createNotification } from "../utils/createNotification.js";
import HttpError from "../utils/httpError.js";
import { serializeUser } from "../utils/serializers.js";

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      throw new HttpError(400, "You cannot follow yourself");
    }

    const target = await User.exists({ _id: userId });
    if (!target) {
      throw new HttpError(404, "User not found");
    }

    const alreadyFollowing = await Follow.exists({
      follower: req.user.id,
      following: userId,
    });
    if (alreadyFollowing) {
      throw new HttpError(409, "You are already following this user");
    }

    await Follow.create({ follower: req.user.id, following: userId });
    await createNotification({
      recipient: userId,
      sender: req.user.id,
      type: "follow",
    });

    res.status(201).json({ isFollowing: true });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await Follow.deleteOne({ follower: req.user.id, following: userId });
    await Notification.deleteOne({
      recipient: userId,
      sender: req.user.id,
      type: "follow",
    });
    res.json({ isFollowing: false });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const rows = await Follow.find({ following: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("follower", "username fullName avatar bio")
      .lean();
    res.json(rows.map((row) => serializeUser(row.follower)));
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const rows = await Follow.find({ follower: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("following", "username fullName avatar bio")
      .lean();
    res.json(rows.map((row) => serializeUser(row.following)));
  } catch (error) {
    next(error);
  }
};
