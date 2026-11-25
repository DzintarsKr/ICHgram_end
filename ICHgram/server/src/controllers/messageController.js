import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { serializeMessage, serializeUser } from "../utils/serializers.js";

const CONVERSATION_LIMIT = 50;
const THREAD_LIMIT = 100;

export const getConversations = async (req, res, next) => {
  try {
    const viewerId = new mongoose.Types.ObjectId(req.user.id);
    const rows = await Message.aggregate([
      { $match: { $or: [{ sender: viewerId }, { recipient: viewerId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", viewerId] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: CONVERSATION_LIMIT },
    ]);

    const users = await User.find({ _id: { $in: rows.map((row) => row._id) } })
      .select("username fullName avatar bio")
      .lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));

    res.json(
      rows.flatMap((row) => {
        const user = usersById.get(String(row._id));
        if (!user) return [];
        return [
          {
            user: serializeUser(user),
            lastMessage: serializeMessage(row.lastMessage, req.user.id),
          },
        ];
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getThread = async (req, res, next) => {
  try {
    const viewerId = req.user.id;
    const partnerId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: viewerId, recipient: partnerId },
        { sender: partnerId, recipient: viewerId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(THREAD_LIMIT)
      .lean();

    res.json(
      messages
        .reverse()
        .map((message) => serializeMessage(message, viewerId)),
    );
  } catch (error) {
    next(error);
  }
};
