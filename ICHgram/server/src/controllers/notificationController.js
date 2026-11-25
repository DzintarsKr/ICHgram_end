import Notification from "../models/notificationModel.js";

const NOTIFICATION_LIMIT = 50;

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_LIMIT)
      .populate("sender", "username avatar")
      .populate("post", "image")
      .lean();

    res.json(
      notifications.map((notification) => ({
        id: String(notification._id),
        type: notification.type,
        createdAt: notification.createdAt,
        sender: {
          id: String(notification.sender._id),
          username: notification.sender.username,
          avatar: notification.sender.avatar,
        },
        postId: notification.post ? String(notification.post._id) : null,
        postImage: notification.post?.image ?? null,
      })),
    );
  } catch (error) {
    next(error);
  }
};
