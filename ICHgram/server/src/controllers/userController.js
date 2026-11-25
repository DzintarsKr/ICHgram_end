import Follow from "../models/followModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import HttpError from "../utils/httpError.js";
import { toDataUrl } from "../utils/imageData.js";
import { serializeUser } from "../utils/serializers.js";
import { isValidUsername, toText } from "../utils/validation.js";

const MAX_FULL_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 300;
const MAX_WEBSITE_LENGTH = 200;

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const [postsCount, followersCount, followingCount, isFollowing] =
      await Promise.all([
        Post.countDocuments({ author: user._id }),
        Follow.countDocuments({ following: user._id }),
        Follow.countDocuments({ follower: user._id }),
        Follow.exists({ follower: req.user.id, following: user._id }),
      ]);

    res.json({
      ...serializeUser(user),
      postsCount,
      followersCount,
      followingCount,
      isFollowing: Boolean(isFollowing),
      isMine: String(user._id) === req.user.id,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body?.username !== undefined) {
      const username = toText(req.body.username).toLowerCase();
      if (!isValidUsername(username)) {
        throw new HttpError(
          400,
          "Username must be 3-30 characters: a-z, 0-9 or underscore",
        );
      }
      const taken = await User.exists({
        username,
        _id: { $ne: req.user.id },
      });
      if (taken) {
        throw new HttpError(409, "Username is already taken");
      }
      updates.username = username;
    }

    if (req.body?.fullName !== undefined) {
      const fullName = toText(req.body.fullName);
      if (fullName.length > MAX_FULL_NAME_LENGTH) {
        throw new HttpError(400, "Full name must be 100 characters or fewer");
      }
      updates.fullName = fullName;
    }

    if (req.body?.bio !== undefined) {
      const bio = toText(req.body.bio);
      if (bio.length > MAX_BIO_LENGTH) {
        throw new HttpError(400, "Bio must be 300 characters or fewer");
      }
      updates.bio = bio;
    }

    if (req.body?.website !== undefined) {
      const website = toText(req.body.website);
      if (website.length > MAX_WEBSITE_LENGTH) {
        throw new HttpError(400, "Website must be 200 characters or fewer");
      }
      updates.website = website;
    }

    if (req.file) {
      updates.avatar = toDataUrl(req.file);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
};
