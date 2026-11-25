import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import { createNotification } from "../utils/createNotification.js";
import HttpError from "../utils/httpError.js";
import { serializeComment } from "../utils/serializers.js";
import { toText } from "../utils/validation.js";

const MAX_COMMENT_LENGTH = 1000;

export const addComment = async (req, res, next) => {
  try {
    const text = toText(req.body?.text);
    if (!text) {
      throw new HttpError(400, "Comment text is required");
    }
    if (text.length > MAX_COMMENT_LENGTH) {
      throw new HttpError(400, "Comment must be 1000 characters or fewer");
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      throw new HttpError(404, "Post not found");
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user.id,
      text,
    });
    await createNotification({
      recipient: post.author,
      sender: req.user.id,
      type: "comment",
      post: post._id,
    });
    await comment.populate("author", "username avatar");

    res.status(201).json(serializeComment(comment, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate("author", "username avatar")
      .lean();
    res.json(comments.map((comment) => serializeComment(comment, req.user.id)));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw new HttpError(404, "Comment not found");
    }
    if (String(comment.author) !== req.user.id) {
      throw new HttpError(403, "You can only delete your own comments");
    }

    await comment.deleteOne();
    res.json({ id: String(comment._id) });
  } catch (error) {
    next(error);
  }
};
