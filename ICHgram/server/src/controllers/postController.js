import Comment from "../models/commentModel.js";
import Follow from "../models/followModel.js";
import Like from "../models/likeModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import HttpError from "../utils/httpError.js";
import { toDataUrl } from "../utils/imageData.js";
import { buildPostCards } from "../utils/serializers.js";
import { toText } from "../utils/validation.js";

const FEED_LIMIT = 50;
const MAX_CAPTION_LENGTH = 2200;

const findPostOrFail = async (id) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new HttpError(404, "Post not found");
  }
  return post;
};

const assertAuthor = (post, userId) => {
  if (String(post.author) !== userId) {
    throw new HttpError(403, "You can only change your own posts");
  }
};

const readCaption = (value) => {
  const caption = toText(value);
  if (caption.length > MAX_CAPTION_LENGTH) {
    throw new HttpError(400, "Caption must be 2200 characters or fewer");
  }
  return caption;
};

export const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(FEED_LIMIT)
      .populate("author", "username avatar")
      .lean();
    res.json(await buildPostCards(posts, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("author", "username avatar")
      .lean();
    res.json(await buildPostCards(posts, req.user.id));
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .lean();
    if (!post) {
      throw new HttpError(404, "Post not found");
    }
    const [card] = await buildPostCards([post], req.user.id);
    res.json(card);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "Image is required");
    }

    const post = await Post.create({
      author: req.user.id,
      caption: readCaption(req.body?.caption),
      image: toDataUrl(req.file),
    });
    await post.populate("author", "username avatar");

    const followers = await Follow.find({ following: req.user.id })
      .select("follower")
      .lean();
    if (followers.length > 0) {
      await Notification.insertMany(
        followers.map((follow) => ({
          recipient: follow.follower,
          sender: req.user.id,
          type: "post",
          post: post._id,
        })),
      );
    }

    const [card] = await buildPostCards([post], req.user.id);
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id);
    assertAuthor(post, req.user.id);

    if (req.body?.caption !== undefined) {
      post.caption = readCaption(req.body.caption);
    }
    if (req.file) {
      post.image = toDataUrl(req.file);
    }

    await post.save();
    await post.populate("author", "username avatar");

    const [card] = await buildPostCards([post], req.user.id);
    res.json(card);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await findPostOrFail(req.params.id);
    assertAuthor(post, req.user.id);

    await Promise.all([
      post.deleteOne(),
      Like.deleteMany({ post: post._id }),
      Comment.deleteMany({ post: post._id }),
      Notification.deleteMany({ post: post._id }),
    ]);

    res.json({ id: String(post._id) });
  } catch (error) {
    next(error);
  }
};
