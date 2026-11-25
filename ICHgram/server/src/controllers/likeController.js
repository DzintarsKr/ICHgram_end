import Like from "../models/likeModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import { createNotification } from "../utils/createNotification.js";
import HttpError from "../utils/httpError.js";
import { serializeUser } from "../utils/serializers.js";

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      throw new HttpError(404, "Post not found");
    }

    const removed = await Like.findOneAndDelete({
      post: post._id,
      user: req.user.id,
    });

    if (removed) {
      await Notification.deleteOne({
        recipient: post.author,
        sender: req.user.id,
        type: "like",
        post: post._id,
      });
    } else {
      await Like.create({ post: post._id, user: req.user.id });
      await createNotification({
        recipient: post.author,
        sender: req.user.id,
        type: "like",
        post: post._id,
      });
    }

    const likeCount = await Like.countDocuments({ post: post._id });
    res.json({ liked: !removed, likeCount });
  } catch (error) {
    next(error);
  }
};

export const getLikes = async (req, res, next) => {
  try {
    const likes = await Like.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar")
      .lean();
    res.json({
      likeCount: likes.length,
      users: likes.map((like) => serializeUser(like.user)),
    });
  } catch (error) {
    next(error);
  }
};
