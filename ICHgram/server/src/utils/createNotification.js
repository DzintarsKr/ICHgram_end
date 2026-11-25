import Notification from "../models/notificationModel.js";

export const createNotification = async ({ recipient, sender, type, post }) => {
  if (String(recipient) === String(sender)) return;
  await Notification.create({ recipient, sender, type, post });
};
