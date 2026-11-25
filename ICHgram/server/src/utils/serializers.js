import Comment from "../models/commentModel.js";
import Like from "../models/likeModel.js";

export const serializeUser = (user) => ({
  id: String(user._id),
  username: user.username,
  fullName: user.fullName,
  bio: user.bio,
  website: user.website,
  avatar: user.avatar,
});

export const serializeComment = (comment, viewerId) => ({
  id: String(comment._id),
  text: comment.text,
  createdAt: comment.createdAt,
  authorId: String(comment.author._id),
  authorUsername: comment.author.username,
  authorAvatar: comment.author.avatar,
  isMine: String(comment.author._id) === viewerId,
});

export const serializeMessage = (message, viewerId) => ({
  id: String(message._id),
  text: message.text,
  createdAt: message.createdAt,
  senderId: String(message.sender),
  recipientId: String(message.recipient),
  isMine: String(message.sender) === viewerId,
});

const countByPost = async (Model, postIds) => {
  const rows = await Model.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: "$post", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
};

export const buildPostCards = async (posts, viewerId) => {
  if (posts.length === 0) return [];

  const postIds = posts.map((post) => post._id);
  const [likeCounts, commentCounts, likedRows] = await Promise.all([
    countByPost(Like, postIds),
    countByPost(Comment, postIds),
    Like.find({ post: { $in: postIds }, user: viewerId }).select("post").lean(),
  ]);
  const likedIds = new Set(likedRows.map((row) => String(row.post)));

  return posts.map((post) => {
    const id = String(post._id);
    return {
      id,
      caption: post.caption,
      image: post.image,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: String(post.author._id),
      authorUsername: post.author.username,
      authorAvatar: post.author.avatar,
      likeCount: likeCounts.get(id) ?? 0,
      likedByMe: likedIds.has(id),
      commentCount: commentCounts.get(id) ?? 0,
      isMine: String(post.author._id) === viewerId,
    };
  });
};
