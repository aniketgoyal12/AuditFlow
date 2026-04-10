const AuditLog = require("../models/auditlogs");
const NoteAccess = require("../models/NoteAccess");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const { assertObjectId, escapeRegex } = require("../utils/validators");

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const action = req.query.action || "all";
  const status = req.query.status || "all";
  const search = req.query.search?.trim() || "";

  const query = {};

  if (req.user.role !== "Admin") {
    query.$or = [{ actor: req.user._id }];
    const accessibleNoteIds = await NoteAccess.find({ userId: req.user._id }).distinct("noteId");
    query.$or.push({ entityType: "Note", entityId: { $in: accessibleNoteIds.map(String) } });
  }

  if (action !== "all") {
    query.action = action;
  }

  if (status !== "all") {
    query.status = status;
  }

  if (search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { summary: { $regex: escapeRegex(search), $options: "i" } },
        { target: { $regex: escapeRegex(search), $options: "i" } },
      ],
    });
  }

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  sendResponse(res, 200, "Audit logs fetched successfully", {
    items: logs.map((log) => ({
      id: log._id,
      user: {
        name: log.actor?.name || "System",
        email: log.actor?.email || "",
      },
      action: log.action,
      actionLabel: log.action
        .split("_")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" "),
      summary: log.summary,
      target: log.target,
      timestamp: log.createdAt,
      ip: log.ipAddress,
      status: log.status,
      location: log.metadata?.location || "Unknown",
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

const getUserLogs = asyncHandler(async (req, res) => {
  assertObjectId(req.params.userId, "User identifier");

  if (req.user.role !== "Admin" && req.params.userId !== req.user._id.toString()) {
    throw new AppError("Not authorized to view these audit logs", 403);
  }

  const logs = await AuditLog.find({ actor: req.params.userId })
    .populate("actor", "name email")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, "User audit logs fetched successfully", logs);
});

module.exports = { getAuditLogs, getUserLogs };
