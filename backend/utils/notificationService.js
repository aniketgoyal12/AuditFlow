const Notification = require("../models/Notification");
const User = require("../models/user");
const { sendEmailInBackground } = require("./email");

const createNotification = async ({
  userId,
  type = "system",
  message,
  metadata = {},
  emailSubject,
  emailText,
  emailHtml,
}) => {
  if (!userId || !message) {
    return null;
  }

  const recipient = await User.findById(userId).select(
    "email name status notificationSettings"
  );

  if (!recipient || recipient.status !== "active") {
    return null;
  }

  const notification = await Notification.create({
    userId: recipient._id,
    type,
    message,
    metadata,
  });

  if (recipient.notificationSettings?.emailNotifications && emailSubject) {
    sendEmailInBackground({
      to: recipient.email,
      subject: emailSubject,
      text: emailText || message,
      html: emailHtml,
    });
  }

  return notification;
};

module.exports = {
  createNotification,
};
