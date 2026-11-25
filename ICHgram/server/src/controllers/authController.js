import crypto from "node:crypto";
import { signToken } from "../config/jwt.js";
import User from "../models/userModel.js";
import HttpError from "../utils/httpError.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
import { serializeUser } from "../utils/serializers.js";
import { isValidEmail, isValidUsername, toText } from "../utils/validation.js";

const MIN_PASSWORD_LENGTH = 6;
const MAX_FULL_NAME_LENGTH = 100;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESET_REQUEST_MESSAGE =
  "If an account matches, a reset link has been sent to its email address.";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const register = async (req, res, next) => {
  try {
    const email = toText(req.body?.email).toLowerCase();
    const username = toText(req.body?.username).toLowerCase();
    const fullName = toText(req.body?.fullName);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !username || !password) {
      throw new HttpError(400, "Email, username and password are required");
    }
    if (!isValidEmail(email)) {
      throw new HttpError(400, "Enter a valid email address");
    }
    if (!isValidUsername(username)) {
      throw new HttpError(
        400,
        "Username must be 3-30 characters: a-z, 0-9 or underscore",
      );
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }
    if (fullName.length > MAX_FULL_NAME_LENGTH) {
      throw new HttpError(400, "Full name must be 100 characters or fewer");
    }

    const existing = await User.exists({ $or: [{ email }, { username }] });
    if (existing) {
      throw new HttpError(409, "Email or username is already taken");
    }

    const user = await User.create({ email, username, fullName, password });
    res
      .status(201)
      .json({ token: signToken(user.id), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const login = toText(req.body?.login).toLowerCase();
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!login || !password) {
      throw new HttpError(400, "Username or email and password are required");
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    }).select("+password");
    const isValid = user ? await user.comparePassword(password) : false;
    if (!isValid) {
      throw new HttpError(401, "Invalid username or password");
    }

    res.json({ token: signToken(user.id), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const identifier = toText(req.body?.identifier).toLowerCase();
    if (!identifier) {
      throw new HttpError(400, "Enter your email or username");
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            resetTokenHash: hashToken(token),
            resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
          },
        },
      );
      await sendPasswordResetEmail(
        user.email,
        `${process.env.APP_URL}/reset/${token}`,
      );
    }

    res.json({ message: RESET_REQUEST_MESSAGE });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = toText(req.body?.token);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";
    if (!token || !password) {
      throw new HttpError(400, "Reset link and new password are required");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }

    const user = await User.findOne({
      resetTokenHash: hashToken(token),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new HttpError(400, "This reset link is invalid or has expired");
    }

    user.password = password;
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Your password has been updated. You can log in now." });
  } catch (error) {
    next(error);
  }
};
