const AuditLog = require("../models/auditlogs");
const Note = require("../models/Note");
const NoteAccess = require("../models/NoteAccess");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const getDashboardData = asyncHandler(async (req, res) => {
  const [accessibleNoteIds, ownedNoteIds] = await Promise.all([
    NoteAccess.find({ userId: req.user._id }).distinct("noteId"),
    NoteAccess.find({
      userId: req.user._id,
      accessLevel: "Owner",
    }).distinct("noteId"),
  ]);
  const auditQuery = {
    $or: [{ actor: req.user._id }, { entityType: "Note", entityId: { $in: accessibleNoteIds.map(String) } }],
  };
  const [totalAuditEvents, collaborators, recentLogs, weeklyNotes] = await Promise.all([
    AuditLog.countDocuments(auditQuery),
    NoteAccess.distinct("userId", {
      noteId: { $in: accessibleNoteIds },
      userId: { $ne: req.user._id },
    }),
    AuditLog.find(auditQuery)
      .populate("actor", "name")
      .sort({ createdAt: -1 })
      .limit(6),
    Note.countDocuments({
      _id: { $in: accessibleNoteIds },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);
  const totalNotes = accessibleNoteIds.length;
  const totalOwned = ownedNoteIds.length;

  const completion = totalNotes === 0 ? 0 : Math.min(100, Math.round((totalOwned / totalNotes) * 100));

  sendResponse(res, 200, "Dashboard data fetched successfully", {
    userName: req.user.name,
    stats: [
      {
        title: "My Notes",
        value: String(totalNotes),
        trend: { value: weeklyNotes, direction: weeklyNotes > 0 ? "up" : "neutral" },
        description: "Accessible documents",
      },
      {
        title: "Audit Events",
        value: String(totalAuditEvents),
        trend: { value: Math.min(totalAuditEvents, 99), direction: totalAuditEvents > 0 ? "up" : "neutral" },
        description: "Tracked workspace events",
      },
      {
        title: "Collaborators",
        value: String(collaborators.length),
        trend: { value: collaborators.length, direction: collaborators.length > 0 ? "up" : "neutral" },
        description: "People collaborating with you",
      },
    ],
    recentActivity: recentLogs.map((log) => ({
      id: log._id,
      user: { name: log.actor?.name || "System" },
      action: log.summary.replace(`${log.actor?.name || "System"} `, ""),
      time: log.createdAt,
      tag: log.target || log.entityType || "System",
      type: ["edit", "comment", "permission", "create", "view"].includes(log.action)
        ? log.action
        : "view",
    })),
    insights: {
      activityIncrease: weeklyNotes * 4 || 0,
      teamPerformance: {
        auditCompletion: completion,
        documentation: Math.min(100, completion + 12),
        collaboration: Math.min(100, collaborators.length * 15),
      },
    },
  });
});

module.exports = { getDashboardData };
