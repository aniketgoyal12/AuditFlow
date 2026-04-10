const Note = require("../models/Note");
const NoteAccess = require("../models/NoteAccess");
const NoteInvite = require("../models/NoteInvite");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const { createAuditLog } = require("../utils/auditLogger");
const {
  NOTE_COLORS,
  NOTE_ACCESS_LEVELS,
  assertObjectId,
  normalizeEmail,
  requireFields,
  sanitizeEnum,
  sanitizeStringArray,
  sanitizeText,
} = require("../utils/validators");

const NOTE_INVITE_DECISIONS = ["accepted", "declined"];
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const formatNote = (note, accessLevel) => ({
  id: note._id.toString(),
  _id: note._id,
  title: note.title,
  content: note.content,
  owner: note.owner?.name || "Unknown User",
  ownerId: note.owner?._id || note.owner,
  role: accessLevel,
  lastModified: note.updatedAt,
  tags: note.tags || [],
  color: note.color,
  collaborators: note.collaborators || 0,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const formatCollaborator = (entry) => ({
  id: entry.userId?._id?.toString?.() || entry.userId?.toString?.() || null,
  name: entry.userId?.name || "Unknown User",
  email: entry.userId?.email || "",
  status: entry.userId?.status || "active",
  accessLevel: entry.accessLevel,
  isOwner: entry.accessLevel === "Owner",
  addedAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

const formatInvite = (invite) => ({
  id: invite._id?.toString?.() || invite._id,
  email: invite.invitedEmail,
  accessLevel: invite.accessLevel,
  status: invite.status,
  invitedAt: invite.createdAt,
  expiresAt: invite.expiresAt,
  invitedBy: invite.invitedBy
    ? {
        id: invite.invitedBy._id?.toString?.() || invite.invitedBy._id,
        name: invite.invitedBy.name,
        email: invite.invitedBy.email,
      }
    : null,
  recipient: invite.invitedUserId
    ? {
        id: invite.invitedUserId._id?.toString?.() || invite.invitedUserId._id,
        name: invite.invitedUserId.name,
        email: invite.invitedUserId.email,
        status: invite.invitedUserId.status,
      }
    : null,
});

const formatIncomingInvite = (invite) => ({
  id: invite._id?.toString?.() || invite._id,
  email: invite.invitedEmail,
  accessLevel: invite.accessLevel,
  status: invite.status,
  invitedAt: invite.createdAt,
  expiresAt: invite.expiresAt,
  note: invite.noteId
    ? {
        id: invite.noteId._id?.toString?.() || invite.noteId._id,
        title: invite.noteId.title,
        color: invite.noteId.color,
        updatedAt: invite.noteId.updatedAt,
        owner: invite.noteId.owner
          ? {
              id: invite.noteId.owner._id?.toString?.() || invite.noteId.owner._id,
              name: invite.noteId.owner.name,
              email: invite.noteId.owner.email,
            }
          : null,
      }
    : null,
  invitedBy: invite.invitedBy
    ? {
        id: invite.invitedBy._id?.toString?.() || invite.invitedBy._id,
        name: invite.invitedBy.name,
        email: invite.invitedBy.email,
      }
    : null,
});

const sanitizeNoteInput = (payload, { partial = false } = {}) => {
  const sanitized = {};

  if (!partial || payload.title !== undefined) {
    sanitized.title = sanitizeText(payload.title, {
      field: "Title",
      maxLength: 120,
    });
  }

  if (!partial || payload.content !== undefined) {
    sanitized.content = sanitizeText(payload.content, {
      field: "Content",
      maxLength: 10000,
      trim: false,
    });
  }

  if (payload.tags !== undefined) {
    sanitized.tags = sanitizeStringArray(payload.tags, {
      field: "Tags",
      maxItems: 10,
      maxLength: 30,
    });
  }

  if (payload.color !== undefined) {
    sanitized.color = sanitizeEnum(payload.color, NOTE_COLORS, "Color");
  }

  return sanitized;
};

const buildPendingInviteQuery = (query = {}) => ({
  ...query,
  status: "pending",
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

const refreshCollaboratorCount = async (note) => {
  note.collaborators = await NoteAccess.countDocuments({ noteId: note._id });
  await note.save();
};

const ensureNoteAccess = async (noteId, userId) => {
  const [note, access] = await Promise.all([
    Note.findById(noteId).populate("owner", "name email"),
    NoteAccess.findOne({
      noteId,
      userId,
    }),
  ]);

  if (!note || !access) {
    throw new AppError("Note not found or access denied", 404);
  }

  return { note, access };
};

const getNotes = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 50);
  const search = req.query.search?.trim() || "";
  const filter = req.query.filter || "all";

  if (!["all", "owner", "shared"].includes(filter)) {
    throw new AppError("Invalid note filter", 400);
  }

  const accessQuery = { userId: req.user._id };
  if (filter === "owner") {
    accessQuery.accessLevel = "Owner";
  }
  if (filter === "shared") {
    accessQuery.accessLevel = { $ne: "Owner" };
  }

  const accessEntries = await NoteAccess.find(accessQuery);
  const noteIds = accessEntries.map((entry) => entry.noteId).filter(Boolean);
  const accessMap = new Map(accessEntries.map((entry) => [entry.noteId.toString(), entry.accessLevel]));

  const query = { _id: { $in: noteIds } };
  if (search) {
    query.$text = { $search: search };
  }

  const [notes, totalRecords] = await Promise.all([
    Note.find(query)
      .populate("owner", "name email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Note.countDocuments(query),
  ]);
  const items = notes.map((note) => formatNote(note, accessMap.get(note._id.toString())));

  sendResponse(res, 200, "Notes fetched successfully", {
    items,
    pagination: {
      page,
      limit,
      total: totalRecords,
      totalPages: Math.max(Math.ceil(totalRecords / limit), 1),
    },
  });
});

const createNote = asyncHandler(async (req, res) => {
  requireFields(req.body, ["title", "content"]);

  const { title, content, tags = [], color = "primary" } = sanitizeNoteInput(req.body);

  const note = await Note.create({
    title,
    content,
    tags,
    color,
    owner: req.user._id,
    collaborators: 1,
  });

  await NoteAccess.create({
    noteId: note._id,
    userId: req.user._id,
    accessLevel: "Owner",
  });

  const populatedNote = await Note.findById(note._id).populate("owner", "name email");

  await createAuditLog({
    actorId: req.user._id,
    action: "create",
    summary: `${req.user.name} created a note`,
    target: title,
    entityType: "Note",
    entityId: note._id.toString(),
    req,
  });

  sendResponse(res, 201, "Note created successfully", formatNote(populatedNote, "Owner"));
});

const getNoteById = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);

  note.lastViewedAt = new Date();
  await note.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "view",
    summary: `${req.user.name} viewed a note`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    req,
  });

  sendResponse(res, 200, "Note fetched successfully", formatNote(note, access.accessLevel));
});

const updateNote = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);

  if (access.accessLevel === "Read Only") {
    throw new AppError("Not authorized to update this note", 403);
  }

  const { title, content, tags, color } = sanitizeNoteInput(req.body, { partial: true });
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (color !== undefined) note.color = color;
  await note.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "edit",
    summary: `${req.user.name} updated a note`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    req,
  });

  sendResponse(res, 200, "Note updated successfully", formatNote(note, access.accessLevel));
});

const deleteNote = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);

  if (access.accessLevel !== "Owner") {
    throw new AppError("Only the owner can delete this note", 403);
  }

  await Note.deleteOne({ _id: req.params.id });
  await Promise.all([
    NoteAccess.deleteMany({ noteId: req.params.id }),
    NoteInvite.deleteMany({ noteId: req.params.id }),
  ]);

  await createAuditLog({
    actorId: req.user._id,
    action: "delete",
    summary: `${req.user.name} deleted a note`,
    target: note.title,
    entityType: "Note",
    entityId: req.params.id,
    req,
  });

  sendResponse(res, 200, "Note removed successfully", null);
});

const getNoteSharing = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);

  if (access.accessLevel !== "Owner") {
    throw new AppError("Only the owner can manage note invitations", 403);
  }

  const [collaborators, invites] = await Promise.all([
    NoteAccess.find({ noteId: req.params.id }).populate("userId", "name email status").sort({ createdAt: 1 }),
    NoteInvite.find(buildPendingInviteQuery({ noteId: req.params.id }))
      .populate("invitedBy", "name email")
      .populate("invitedUserId", "name email status")
      .sort({ createdAt: -1 }),
  ]);

  sendResponse(res, 200, "Note sharing fetched successfully", {
    note: {
      id: note._id.toString(),
      title: note.title,
      owner: {
        id: note.owner?._id?.toString?.() || note.owner?._id || note.owner,
        name: note.owner?.name || "Unknown User",
        email: note.owner?.email || "",
      },
    },
    collaborators: collaborators.map(formatCollaborator),
    invites: invites.map(formatInvite),
  });
});

const shareNote = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "accessLevel"]);

  assertObjectId(req.params.id, "Note identifier");

  const email = normalizeEmail(req.body.email);
  const accessLevel = sanitizeEnum(
    req.body.accessLevel,
    NOTE_ACCESS_LEVELS.filter((level) => level !== "Owner"),
    "Access level"
  );

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);
  if (access.accessLevel !== "Owner") {
    throw new AppError("Only the owner can share this note", 403);
  }

  if (email === req.user.email?.toLowerCase()) {
    throw new AppError("You already own this note", 400);
  }

  const collaborator = await User.findOne({ email });
  if (collaborator && collaborator.status !== "active") {
    throw new AppError("Only active users can be invited to collaborate", 400);
  }

  const existingAccess = collaborator
    ? await NoteAccess.findOne({ noteId: req.params.id, userId: collaborator._id })
    : null;

  if (existingAccess) {
    if (existingAccess.accessLevel === "Owner") {
      throw new AppError("This user already owns the note", 400);
    }

    await NoteAccess.findOneAndUpdate(
      { noteId: req.params.id, userId: collaborator._id },
      {
        noteId: req.params.id,
        userId: collaborator._id,
        accessLevel,
      },
      { new: true }
    );

    await refreshCollaboratorCount(note);

    await createAuditLog({
      actorId: req.user._id,
      action: "permission",
      summary: `${req.user.name} updated note access for ${collaborator.name}`,
      target: note.title,
      entityType: "Note",
      entityId: note._id.toString(),
      metadata: { collaborator: collaborator.email, accessLevel },
      req,
    });

    sendResponse(res, 200, "Collaborator access updated successfully", {
      mode: "updated",
      collaborator: {
        id: collaborator._id.toString(),
        name: collaborator.name,
        email: collaborator.email,
        accessLevel,
      },
    });
    return;
  }

  const invite = await NoteInvite.findOneAndUpdate(
    buildPendingInviteQuery({
      noteId: req.params.id,
      invitedEmail: email,
    }),
    {
      noteId: req.params.id,
      invitedBy: req.user._id,
      invitedEmail: email,
      invitedUserId: collaborator?._id || null,
      accessLevel,
      status: "pending",
      respondedAt: null,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} invited ${email} to collaborate on a note`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { collaborator: email, accessLevel, inviteId: invite._id?.toString?.() || invite._id },
    req,
  });

  sendResponse(res, 200, "Invite sent successfully", {
    mode: "invited",
    invite: {
      id: invite._id?.toString?.() || invite._id,
      email,
      accessLevel,
      status: "pending",
      invitedAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      recipient: collaborator
        ? {
            id: collaborator._id.toString(),
            name: collaborator.name,
            email: collaborator.email,
            status: collaborator.status,
          }
        : null,
    },
  });
});

const getMyNoteInvitations = asyncHandler(async (req, res) => {
  const invitations = await NoteInvite.find(
    buildPendingInviteQuery({
      invitedEmail: req.user.email.toLowerCase(),
    })
  )
    .populate({
      path: "noteId",
      select: "title color owner updatedAt",
      populate: {
        path: "owner",
        select: "name email",
      },
    })
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });

  const items = invitations.filter((invite) => invite.noteId).map(formatIncomingInvite);

  sendResponse(res, 200, "Note invitations fetched successfully", {
    items,
  });
});

const respondToNoteInvite = asyncHandler(async (req, res) => {
  requireFields(req.body, ["decision"]);
  assertObjectId(req.params.inviteId, "Invite identifier");

  const decision = sanitizeEnum(req.body.decision, NOTE_INVITE_DECISIONS, "Decision");
  const invite = await NoteInvite.findById(req.params.inviteId);

  if (!invite) {
    throw new AppError("Invite not found", 404);
  }

  if (invite.status !== "pending") {
    throw new AppError("This invite is no longer active", 400);
  }

  const currentEmail = req.user.email.toLowerCase();
  const matchesInvite =
    invite.invitedEmail === currentEmail ||
    invite.invitedUserId?.toString?.() === req.user._id.toString();

  if (!matchesInvite) {
    throw new AppError("This invite does not belong to your account", 403);
  }

  if (invite.expiresAt && invite.expiresAt.getTime() <= Date.now()) {
    invite.status = "expired";
    invite.respondedAt = new Date();
    invite.invitedUserId = req.user._id;
    await invite.save();
    throw new AppError("This invite has expired", 410);
  }

  const note = await Note.findById(invite.noteId).populate("owner", "name email");
  if (!note) {
    throw new AppError("Note not found", 404);
  }

  invite.invitedUserId = req.user._id;
  invite.respondedAt = new Date();

  if (decision === "accepted") {
    await NoteAccess.findOneAndUpdate(
      { noteId: invite.noteId, userId: req.user._id },
      {
        noteId: invite.noteId,
        userId: req.user._id,
        accessLevel: invite.accessLevel,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    invite.status = "accepted";
    await invite.save();
    await refreshCollaboratorCount(note);

    await createAuditLog({
      actorId: req.user._id,
      action: "permission",
      summary: `${req.user.name} accepted a note invite`,
      target: note.title,
      entityType: "Note",
      entityId: note._id.toString(),
      metadata: { accessLevel: invite.accessLevel },
      req,
    });

    sendResponse(res, 200, "Invitation accepted successfully", {
      note: {
        id: note._id.toString(),
        title: note.title,
      },
      accessLevel: invite.accessLevel,
    });
    return;
  }

  invite.status = "declined";
  await invite.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} declined a note invite`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { accessLevel: invite.accessLevel },
    req,
  });

  sendResponse(res, 200, "Invitation declined successfully", null);
});

const cancelNoteInvite = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");
  assertObjectId(req.params.inviteId, "Invite identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);
  if (access.accessLevel !== "Owner") {
    throw new AppError("Only the owner can manage note invitations", 403);
  }

  const invite = await NoteInvite.findOne({
    _id: req.params.inviteId,
    noteId: req.params.id,
    status: "pending",
  });

  if (!invite) {
    throw new AppError("Invite not found", 404);
  }

  invite.status = "cancelled";
  invite.respondedAt = new Date();
  await invite.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} cancelled a note invite`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { collaborator: invite.invitedEmail },
    req,
  });

  sendResponse(res, 200, "Invite cancelled successfully", null);
});

const removeNoteCollaborator = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");
  assertObjectId(req.params.userId, "Collaborator identifier");

  const { note, access } = await ensureNoteAccess(req.params.id, req.user._id);
  if (access.accessLevel !== "Owner") {
    throw new AppError("Only the owner can remove collaborators", 403);
  }

  if (req.params.userId === req.user._id.toString()) {
    throw new AppError("You cannot remove the note owner", 400);
  }

  const collaborator = await User.findById(req.params.userId).select("name email status");
  const collaboratorAccess = await NoteAccess.findOne({
    noteId: req.params.id,
    userId: req.params.userId,
  });

  if (!collaborator || !collaboratorAccess) {
    throw new AppError("Collaborator not found", 404);
  }

  if (collaboratorAccess.accessLevel === "Owner") {
    throw new AppError("You cannot remove the note owner", 400);
  }

  await NoteAccess.deleteOne({
    noteId: req.params.id,
    userId: req.params.userId,
  });

  await NoteInvite.updateMany(
    buildPendingInviteQuery({
      noteId: req.params.id,
      invitedEmail: collaborator.email.toLowerCase(),
    }),
    {
      status: "cancelled",
      respondedAt: new Date(),
    }
  );

  await refreshCollaboratorCount(note);

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} removed ${collaborator.name} from a note`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { collaborator: collaborator.email },
    req,
  });

  sendResponse(res, 200, "Collaborator removed successfully", null);
});

module.exports = {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteSharing,
  shareNote,
  getMyNoteInvitations,
  respondToNoteInvite,
  cancelNoteInvite,
  removeNoteCollaborator,
};
