import mongoose from "mongoose";
import { Server } from "socket.io";
import { verifyToken } from "../config/jwt.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import HttpError from "../utils/httpError.js";
import { serializeMessage } from "../utils/serializers.js";
import { toText } from "../utils/validation.js";

const MAX_MESSAGE_LENGTH = 1000;

const userRoom = (userId) => `user:${userId}`;

const createDirectMessage = async (io, senderId, payload) => {
  const recipientId = toText(payload?.recipientId);
  const text = toText(payload?.text);

  if (!text) {
    throw new HttpError(400, "Message text is required");
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(400, "Message must be 1000 characters or fewer");
  }
  if (!mongoose.isValidObjectId(recipientId)) {
    throw new HttpError(404, "User not found");
  }
  if (recipientId === senderId) {
    throw new HttpError(400, "You cannot message yourself");
  }
  if (!(await User.exists({ _id: recipientId }))) {
    throw new HttpError(404, "User not found");
  }

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    text,
  });

  io.to(userRoom(recipientId)).emit(
    "message:new",
    serializeMessage(message, recipientId),
  );
  io.to(userRoom(senderId)).emit(
    "message:new",
    serializeMessage(message, senderId),
  );

  return serializeMessage(message, senderId);
};

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer);

  io.use((socket, next) => {
    try {
      socket.data.userId = verifyToken(socket.handshake.auth?.token).id;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.data.userId));

    socket.on("message:send", async (payload, ack) => {
      try {
        const message = await createDirectMessage(
          io,
          socket.data.userId,
          payload,
        );
        ack?.({ ok: true, message });
      } catch (error) {
        if (!(error instanceof HttpError)) {
          console.error(error);
        }
        ack?.({
          ok: false,
          message:
            error instanceof HttpError
              ? error.message
              : "Could not send message",
        });
      }
    });
  });

  return io;
};
