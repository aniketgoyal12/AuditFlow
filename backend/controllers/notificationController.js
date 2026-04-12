const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const { assertObjectId } = require("../utils/validators");

const formatNotification = (notification) => ({
  id: notification._id?.toString?.() || notification._id,
  type: notification.type,
  message: notification.message,
  isRead: Boolean(notification.isRead),
  readAt: notification.readAt,
  metadata: notification.metadata || {},
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const [items, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  sendResponse(res, 200, "Notifications fetched successfully", {
    items: items.map(formatNotification),
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasMore: page * limit < total,
    },
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Notification identifier");

  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  notification.isRead = true;
  notification.readAt = notification.readAt || new Date();
  await notification.save();

  sendResponse(res, 200, "Notification marked as read", formatNotification(notification));
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  sendResponse(res, 200, "All notifications marked as read", null);
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
