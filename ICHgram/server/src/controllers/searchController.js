import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { buildPostCards, serializeUser } from "../utils/serializers.js";
import { escapeRegex, toText } from "../utils/validation.js";

const SEARCH_LIMIT = 20;
const EXPLORE_LIMIT = 50;

export const searchUsers = async (req, res, next) => {
  try {
    const query = toText(req.query.q);
    if (!query) {
      return res.json([]);
    }

    const pattern = new RegExp(escapeRegex(query), "i");
    const users = await User.find({
      $or: [{ username: pattern }, { fullName: pattern }],
    })
      .limit(SEARCH_LIMIT)
      .lean();
    res.json(users.map((user) => serializeUser(user)));
  } catch (error) {
    next(error);
  }
};

export const getExplorePosts = async (req, res, next) => {
  try {
    const sampled = await Post.aggregate([{ $sample: { size: EXPLORE_LIMIT } }]);
    const posts = await Post.populate(sampled, {
      path: "author",
      select: "username avatar",
    });
    res.json(await buildPostCards(posts, req.user.id));
  } catch (error) {
    next(error);
  }
};
