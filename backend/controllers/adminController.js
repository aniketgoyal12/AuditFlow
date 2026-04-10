const AuditLog = require("../models/auditlogs");
const Note = require("../models/Note");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const { createAuditLog } = require("../utils/auditLogger");
const {
  USER_ROLES,
  USER_STATUSES,
  assertObjectId,
  sanitizeEnum,
} = require("../utils/validators");

const getAdminOverview = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalNotes,
    totalAuditEvents,
    failedEvents,
    recentUsers,
    notifications,
    recentActivities,
    noteCounts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    Note.countDocuments(),
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ status: "failed" }),
    User.find().sort({ createdAt: -1 }).limit(20).select("-password"),
    AuditLog.find({
      $or: [{ status: "failed" }, { action: "register" }, { action: "login" }],
    })
      .populate("actor", "name")
      .sort({ createdAt: -1 })
      .limit(6),
    AuditLog.find().populate("actor", "name email").sort({ createdAt: -1 }).limit(10),
    Note.aggregate([{ $group: { _id: "$owner", count: { $sum: 1 } } }]),
  ]);
  const noteMap = new Map(noteCounts.map((item) => [item._id.toString(), item.count]));

  sendResponse(res, 200, "Admin overview fetched successfully", {
    overviewStats: {
      totalUsers,
      activeUsers,
      totalNotes,
      totalAuditEvents,
      failedEvents,
    },
    users: recentUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      notes: noteMap.get(user._id.toString()) || 0,
      lastActive: user.lastLoginAt || user.updatedAt,
      joined: user.createdAt,
      location: "Unknown",
    })),
    notifications: notifications.map((entry) => ({
      id: entry._id,
      type: entry.status === "failed" ? "error" : entry.action === "register" ? "info" : "success",
      message: entry.summary,
      time: entry.createdAt,
      unread: entry.status === "failed",
    })),
    recentActivities: recentActivities.map((entry) => ({
      id: entry._id,
      user: entry.actor?.name || "System",
      action: entry.action,
      target: entry.target,
      time: entry.createdAt,
      type: entry.action,
      ip: entry.ipAddress,
      status: entry.status,
      location: entry.metadata?.location || "Unknown",
    })),
  });
});

const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select("-password");
  const noteCounts = await Note.aggregate([{ $group: { _id: "$owner", count: { $sum: 1 } } }]);
  const noteMap = new Map(noteCounts.map((item) => [item._id.toString(), item.count]));

  sendResponse(
    res,
    200,
    "Users fetched successfully",
    users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      notes: noteMap.get(user._id.toString()) || 0,
      lastActive: user.lastLoginAt || user.updatedAt,
      joined: user.createdAt,
      location: "Unknown",
    }))
  );
});

const updateUserStatus = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "User identifier");

  const status = req.body.status ? sanitizeEnum(req.body.status, USER_STATUSES, "Status") : undefined;
  const role = req.body.role ? sanitizeEnum(req.body.role, USER_ROLES, "Role") : undefined;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (req.user._id.toString() === user._id.toString()) {
    throw new AppError("Administrators cannot change their own role or status here", 400);
  }

  if (
    user.role === "Admin" &&
    ((role && role !== "Admin") || (status && status !== "active"))
  ) {
    const activeAdminCount = await User.countDocuments({
      role: "Admin",
      status: "active",
    });

    if (activeAdminCount <= 1) {
      throw new AppError("At least one active administrator must remain in the system", 400);
    }
  }

  if (status) {
    user.status = status;
  }

  if (role) {
    user.role = role;
  }

  await user.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} updated ${user.name}'s access`,
    target: user.email,
    entityType: "User",
    entityId: user._id.toString(),
    metadata: { status: user.status, role: user.role },
    req,
  });

  sendResponse(res, 200, "User updated successfully", {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
});

module.exports = { getAdminOverview, getAdminUsers, updateUserStatus };
