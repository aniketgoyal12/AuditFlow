const crypto = require("crypto");

const Note = require("../models/Note");
const NoteAccess = require("../models/NoteAccess");
const NoteInvite = require("../models/NoteInvite");
const NoteVersion = require("../models/NoteVersion");
const NoteShareLink = require("../models/NoteShareLink");
const User = require("../models/user");
const { getEnv } = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const { createAuditLog } = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");
const { sendEmailInBackground } = require("../utils/email");
const {
  NOTE_COLORS,
  assertObjectId,
  normalizeEmail,
  requireFields,
  sanitizeEnum,
  sanitizeStringArray,
  sanitizeText,
} = require("../utils/validators");
const {
  canEditNote,
  getNotePermissionLabel,
  getNotePermissionSlug,
  isNoteOwnerPermission,
  toStoredNotePermission,
} = require("../utils/notePermissions");

const NOTE_INVITE_DECISIONS = ["accepted", "declined"];
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const SHARE_LINK_VISIBILITIES = ["private", "public"];
const NOTE_FILTERS = ["all", "owner", "shared"];
const NOTE_DATE_RANGES = ["all", "today", "7d", "30d", "90d"];

const formatOwner = (owner) => ({
  id: owner?._id?.toString?.() || owner?._id || owner,
  name: owner?.name || "Unknown User",
  email: owner?.email || "",
});

const formatNote = (note, accessLevel) => ({
  id: note._id.toString(),
  _id: note._id,
  title: note.title,
  content: note.content,
  owner: note.owner?.name || "Unknown User",
  ownerDetails: formatOwner(note.owner),
  ownerId: note.owner?._id || note.owner,
  role: getNotePermissionLabel(accessLevel),
  permission: getNotePermissionSlug(accessLevel),
  canEdit: canEditNote(accessLevel),
  canShare: isNoteOwnerPermission(accessLevel),
  lastModified: note.updatedAt,
  tags: note.tags || [],
  color: note.color,
  collaborators: note.collaborators || 0,
  currentVersion: note.currentVersion || 1,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const formatCollaborator = (entry) => ({
  id: entry.userId?._id?.toString?.() || entry.userId?.toString?.() || null,
  name: entry.userId?.name || "Unknown User",
  email: entry.userId?.email || "",
  status: entry.userId?.status || "active",
  accessLevel: getNotePermissionLabel(entry.accessLevel),
  permission: getNotePermissionSlug(entry.accessLevel),
  isOwner: isNoteOwnerPermission(entry.accessLevel),
  addedAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

const formatInvite = (invite) => ({
  id: invite._id?.toString?.() || invite._id,
  email: invite.invitedEmail,
  accessLevel: getNotePermissionLabel(invite.accessLevel),
  permission: getNotePermissionSlug(invite.accessLevel),
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
  accessLevel: getNotePermissionLabel(invite.accessLevel),
  permission: getNotePermissionSlug(invite.accessLevel),
  status: invite.status,
  invitedAt: invite.createdAt,
  expiresAt: invite.expiresAt,
  note: invite.noteId
    ? {
        id: invite.noteId._id?.toString?.() || invite.noteId._id,
        title: invite.noteId.title,
        color: invite.noteId.color,
        updatedAt: invite.noteId.updatedAt,
        owner: invite.noteId.owner ? formatOwner(invite.noteId.owner) : null,
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

const buildShareUrl = (token) => {
  const { appUrl } = getEnv();

  if (!appUrl) {
    return "";
  }

  return `${appUrl.replace(/\/+$/, "")}/shared/${token}`;
};

const buildAppUrl = (path = "/") => {
  const { appUrl } = getEnv();

  if (!appUrl) {
    return "";
  }

  return `${appUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};

const formatShareLink = (link) => {
  if (!link) {
    return null;
  }

  return {
    id: link._id?.toString?.() || link._id,
    token: link.token,
    visibility: link.visibility,
    isActive: Boolean(link.isActive),
    expiresAt: link.expiresAt,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    lastAccessedAt: link.lastAccessedAt,
    accessCount: link.accessCount || 0,
    sharePath: `/shared/${link.token}`,
    shareUrl: buildShareUrl(link.token),
  };
};

const formatVersion = (version, currentVersion) => ({
  id: version._id?.toString?.() || version._id,
  versionNumber: version.versionNumber,
  title: version.title,
  content: version.content,
  tags: version.tags || [],
  color: version.color,
  sourceAction: version.sourceAction,
  createdAt: version.createdAt,
  isCurrent: version.versionNumber === currentVersion,
  updatedBy: version.updatedBy
    ? {
        id: version.updatedBy._id?.toString?.() || version.updatedBy._id,
        name: version.updatedBy.name,
        email: version.updatedBy.email,
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

const sanitizeShareLinkInput = (payload = {}) => {
  const visibility = payload.visibility
    ? sanitizeEnum(payload.visibility, SHARE_LINK_VISIBILITIES, "Link visibility")
    : "private";

  let expiresAt = null;
  if (payload.expiresAt !== undefined && payload.expiresAt !== null && payload.expiresAt !== "") {
    const parsedDate = new Date(payload.expiresAt);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("Expiry date is invalid", 400);
    }
    if (parsedDate.getTime() <= Date.now()) {
      throw new AppError("Expiry date must be in the future", 400);
    }
    expiresAt = parsedDate;
  }

  return {
    visibility,
    expiresAt,
    regenerate: Boolean(payload.regenerate),
  };
};

const buildPendingInviteQuery = (query = {}) => ({
  ...query,
  status: "pending",
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

const resolveUpdatedAtRange = (query = {}) => {
  const range = {};
  const now = Date.now();
  const dateRange = query.dateRange || "all";

  if (!NOTE_DATE_RANGES.includes(dateRange)) {
    throw new AppError("Invalid date range filter", 400);
  }

  if (dateRange === "today") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    range.$gte = startOfDay;
  } else if (dateRange === "7d") {
    range.$gte = new Date(now - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "30d") {
    range.$gte = new Date(now - 30 * 24 * 60 * 60 * 1000);
  } else if (dateRange === "90d") {
    range.$gte = new Date(now - 90 * 24 * 60 * 60 * 1000);
  }

  if (query.dateFrom) {
    const fromDate = new Date(query.dateFrom);
    if (Number.isNaN(fromDate.getTime())) {
      throw new AppError("dateFrom must be a valid date", 400);
    }
    range.$gte = fromDate;
  }

  if (query.dateTo) {
    const toDate = new Date(query.dateTo);
    if (Number.isNaN(toDate.getTime())) {
      throw new AppError("dateTo must be a valid date", 400);
    }
    toDate.setHours(23, 59, 59, 999);
    range.$lte = toDate;
  }

  return Object.keys(range).length ? range : null;
};

const refreshCollaboratorCount = async (note) => {
  note.collaborators = await NoteAccess.countDocuments({ noteId: note._id });
  await note.save();
};

const createNoteVersionSnapshot = async (note, updatedBy, sourceAction) => {
  await NoteVersion.create({
    noteId: note._id,
    versionNumber: note.currentVersion || 1,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    color: note.color,
    updatedBy,
    sourceAction,
  });
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

const ensureOwnerAccess = async (noteId, userId) => {
  const { note, access } = await ensureNoteAccess(noteId, userId);

  if (!isNoteOwnerPermission(access.accessLevel)) {
    throw new AppError("Only the owner can manage this note", 403);
  }

  return { note, access };
};

const ensureEditableAccess = async (noteId, userId) => {
  const { note, access } = await ensureNoteAccess(noteId, userId);

  if (!canEditNote(access.accessLevel)) {
    throw new AppError("Not authorized to update this note", 403);
  }

  return { note, access };
};

const buildSharedNoteEmail = ({ actorName, noteTitle, shareUrl }) => ({
  subject: `${actorName} shared a note with you in AuditFlow`,
  text: [
    `${actorName} shared "${noteTitle}" with you in AuditFlow.`,
    shareUrl ? `Open it here: ${shareUrl}` : "Sign in to AuditFlow to view the note.",
  ].join("\n\n"),
});

const getNotes = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 50);
  const search = req.query.search?.trim() || "";
  const filter = req.query.filter || "all";
  const updatedAtRange = resolveUpdatedAtRange(req.query);

  if (!NOTE_FILTERS.includes(filter)) {
    throw new AppError("Invalid note filter", 400);
  }

  const accessQuery = { userId: req.user._id };
  if (filter === "owner") {
    accessQuery.accessLevel = "Owner";
  }
  if (filter === "shared") {
    accessQuery.accessLevel = { $ne: "Owner" };
  }

  const accessEntries = await NoteAccess.find(accessQuery).lean();
  const noteIds = accessEntries.map((entry) => entry.noteId).filter(Boolean);
  const accessMap = new Map(accessEntries.map((entry) => [entry.noteId.toString(), entry.accessLevel]));

  const query = { _id: { $in: noteIds } };
  if (search) {
    query.$text = { $search: search };
  }
  if (updatedAtRange) {
    query.updatedAt = updatedAtRange;
  }

  const [notes, totalRecords] = await Promise.all([
    Note.find(query)
      .populate("owner", "name email")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Note.countDocuments(query),
  ]);

  sendResponse(res, 200, "Notes fetched successfully", {
    items: notes.map((note) => formatNote(note, accessMap.get(note._id.toString()))),
    pagination: {
      page,
      limit,
      total: totalRecords,
      totalPages: Math.max(Math.ceil(totalRecords / limit), 1),
      hasMore: page * limit < totalRecords,
    },
    filters: {
      search,
      filter,
      dateRange: req.query.dateRange || "all",
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null,
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
    currentVersion: 1,
  });

  await Promise.all([
    NoteAccess.create({
      noteId: note._id,
      userId: req.user._id,
      accessLevel: "Owner",
    }),
    createNoteVersionSnapshot(note, req.user._id, "create"),
  ]);

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

  const { note, access } = await ensureEditableAccess(req.params.id, req.user._id);
  const { title, content, tags, color } = sanitizeNoteInput(req.body, { partial: true });
  const updateFields = { title, content, tags, color };
  const providedFields = Object.entries(updateFields).filter(([, value]) => value !== undefined);

  if (providedFields.length === 0) {
    throw new AppError("At least one note field must be provided", 400);
  }

  const hasChanges = providedFields.some(([field, value]) => {
    if (field === "tags") {
      return JSON.stringify(note.tags || []) !== JSON.stringify(value || []);
    }

    return note[field] !== value;
  });

  if (!hasChanges) {
    sendResponse(res, 200, "No note changes detected", formatNote(note, access.accessLevel));
    return;
  }

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (color !== undefined) note.color = color;

  note.currentVersion = (note.currentVersion || 1) + 1;
  await note.save();
  await createNoteVersionSnapshot(note, req.user._id, "update");

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

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);

  await Promise.all([
    Note.deleteOne({ _id: req.params.id }),
    NoteAccess.deleteMany({ noteId: req.params.id }),
    NoteInvite.deleteMany({ noteId: req.params.id }),
    NoteVersion.deleteMany({ noteId: req.params.id }),
    NoteShareLink.deleteOne({ noteId: req.params.id }),
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

const getNoteVersions = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note } = await ensureNoteAccess(req.params.id, req.user._id);
  const versions = await NoteVersion.find({ noteId: req.params.id })
    .populate("updatedBy", "name email")
    .sort({ versionNumber: -1 });

  sendResponse(res, 200, "Note version history fetched successfully", {
    currentVersion: note.currentVersion || 1,
    items: versions.map((version) => formatVersion(version, note.currentVersion || 1)),
  });
});

const restoreNoteVersion = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");
  assertObjectId(req.params.versionId, "Version identifier");

  const { note, access } = await ensureEditableAccess(req.params.id, req.user._id);
  const version = await NoteVersion.findOne({
    _id: req.params.versionId,
    noteId: req.params.id,
  }).populate("updatedBy", "name email");

  if (!version) {
    throw new AppError("Version not found", 404);
  }

  note.title = version.title;
  note.content = version.content;
  note.tags = version.tags || [];
  note.color = version.color;
  note.currentVersion = (note.currentVersion || 1) + 1;
  await note.save();
  await createNoteVersionSnapshot(note, req.user._id, "restore");

  await createAuditLog({
    actorId: req.user._id,
    action: "edit",
    summary: `${req.user.name} restored note version ${version.versionNumber}`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { restoredVersion: version.versionNumber },
    req,
  });

  sendResponse(res, 200, "Note restored successfully", {
    note: formatNote(note, access.accessLevel),
    restoredFrom: formatVersion(version, note.currentVersion),
  });
});

const getNoteSharing = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);

  const [collaborators, invites, shareLink] = await Promise.all([
    NoteAccess.find({ noteId: req.params.id })
      .populate("userId", "name email status")
      .sort({ createdAt: 1 }),
    NoteInvite.find(buildPendingInviteQuery({ noteId: req.params.id }))
      .populate("invitedBy", "name email")
      .populate("invitedUserId", "name email status")
      .sort({ createdAt: -1 }),
    NoteShareLink.findOne({ noteId: req.params.id }),
  ]);

  sendResponse(res, 200, "Note sharing fetched successfully", {
    note: {
      id: note._id.toString(),
      title: note.title,
      owner: formatOwner(note.owner),
    },
    collaborators: collaborators.map(formatCollaborator),
    invites: invites.map(formatInvite),
    shareLink: formatShareLink(shareLink),
  });
});

const shareNote = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "accessLevel"]);
  assertObjectId(req.params.id, "Note identifier");

  const email = normalizeEmail(req.body.email);
  const storedAccessLevel = toStoredNotePermission(req.body.accessLevel, {
    allowOwner: false,
  });
  const displayAccessLevel = getNotePermissionLabel(storedAccessLevel);

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);

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
    if (isNoteOwnerPermission(existingAccess.accessLevel)) {
      throw new AppError("This user already owns the note", 400);
    }

    await NoteAccess.findOneAndUpdate(
      { noteId: req.params.id, userId: collaborator._id },
      {
        noteId: req.params.id,
        userId: collaborator._id,
        accessLevel: storedAccessLevel,
      },
      { new: true }
    );

    await refreshCollaboratorCount(note);

    await createNotification({
      userId: collaborator._id,
      type: "share",
      message: `${req.user.name} updated your access to "${note.title}"`,
      metadata: {
        noteId: note._id.toString(),
        accessLevel: getNotePermissionSlug(storedAccessLevel),
      },
      emailSubject: `${req.user.name} updated a shared note in AuditFlow`,
      emailText: buildSharedNoteEmail({
        actorName: req.user.name,
        noteTitle: note.title,
        shareUrl: buildAppUrl("/notepad"),
      }).text,
    });

    await createAuditLog({
      actorId: req.user._id,
      action: "permission",
      summary: `${req.user.name} updated note access for ${collaborator.name}`,
      target: note.title,
      entityType: "Note",
      entityId: note._id.toString(),
      metadata: { collaborator: collaborator.email, accessLevel: storedAccessLevel },
      req,
    });

    sendResponse(res, 200, "Collaborator access updated successfully", {
      mode: "updated",
      collaborator: {
        id: collaborator._id.toString(),
        name: collaborator.name,
        email: collaborator.email,
        accessLevel: displayAccessLevel,
        permission: getNotePermissionSlug(storedAccessLevel),
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
      accessLevel: storedAccessLevel,
      status: "pending",
      respondedAt: null,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (collaborator) {
    await createNotification({
      userId: collaborator._id,
      type: "invite",
      message: `${req.user.name} shared "${note.title}" with you`,
      metadata: {
        noteId: note._id.toString(),
        inviteId: invite._id?.toString?.() || invite._id,
        accessLevel: getNotePermissionSlug(storedAccessLevel),
      },
      emailSubject: `${req.user.name} shared a note with you in AuditFlow`,
      emailText: buildSharedNoteEmail({
        actorName: req.user.name,
        noteTitle: note.title,
        shareUrl: buildAppUrl("/notepad"),
      }).text,
    });
  }

  if (!collaborator) {
    const emailPayload = buildSharedNoteEmail({
      actorName: req.user.name,
      noteTitle: note.title,
      shareUrl: buildAppUrl("/"),
    });
    sendEmailInBackground({
      to: email,
      subject: emailPayload.subject,
      text: emailPayload.text,
    });
  }

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} invited ${email} to collaborate on a note`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: {
      collaborator: email,
      accessLevel: storedAccessLevel,
      inviteId: invite._id?.toString?.() || invite._id,
    },
    req,
  });

  sendResponse(res, 200, "Invite sent successfully", {
    mode: "invited",
    invite: {
      id: invite._id?.toString?.() || invite._id,
      email,
      accessLevel: displayAccessLevel,
      permission: getNotePermissionSlug(storedAccessLevel),
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

  sendResponse(res, 200, "Note invitations fetched successfully", {
    items: invitations.filter((invite) => invite.noteId).map(formatIncomingInvite),
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

    await createNotification({
      userId: note.owner?._id,
      type: "share",
      message: `${req.user.name} accepted access to "${note.title}"`,
      metadata: {
        noteId: note._id.toString(),
        inviteId: invite._id?.toString?.() || invite._id,
      },
    });

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
      accessLevel: getNotePermissionLabel(invite.accessLevel),
      permission: getNotePermissionSlug(invite.accessLevel),
    });
    return;
  }

  invite.status = "declined";
  await invite.save();

  await createNotification({
    userId: note.owner?._id,
    type: "share",
    message: `${req.user.name} declined access to "${note.title}"`,
    metadata: {
      noteId: note._id.toString(),
      inviteId: invite._id?.toString?.() || invite._id,
    },
  });

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

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);
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

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);

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

  if (isNoteOwnerPermission(collaboratorAccess.accessLevel)) {
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

  await createNotification({
    userId: collaborator._id,
    type: "share",
    message: `${req.user.name} removed your access to "${note.title}"`,
    metadata: {
      noteId: note._id.toString(),
    },
  });

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

const getNoteShareLink = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  await ensureOwnerAccess(req.params.id, req.user._id);
  const shareLink = await NoteShareLink.findOne({ noteId: req.params.id });

  sendResponse(res, 200, "Share link fetched successfully", formatShareLink(shareLink));
});

const upsertNoteShareLink = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);
  const { visibility, expiresAt, regenerate } = sanitizeShareLinkInput(req.body);
  const existingLink = await NoteShareLink.findOne({ noteId: req.params.id });
  const token = regenerate || !existingLink ? crypto.randomBytes(24).toString("hex") : existingLink.token;

  const shareLink = await NoteShareLink.findOneAndUpdate(
    { noteId: req.params.id },
    {
      noteId: req.params.id,
      createdBy: req.user._id,
      token,
      visibility,
      expiresAt,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} updated a share link`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    metadata: { visibility, expiresAt: expiresAt?.toISOString?.() || null },
    req,
  });

  sendResponse(res, 200, "Share link saved successfully", formatShareLink(shareLink));
});

const revokeNoteShareLink = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Note identifier");

  const { note } = await ensureOwnerAccess(req.params.id, req.user._id);
  const shareLink = await NoteShareLink.findOne({ noteId: req.params.id });

  if (!shareLink) {
    throw new AppError("Share link not found", 404);
  }

  shareLink.isActive = false;
  await shareLink.save();

  await createAuditLog({
    actorId: req.user._id,
    action: "permission",
    summary: `${req.user.name} revoked a share link`,
    target: note.title,
    entityType: "Note",
    entityId: note._id.toString(),
    req,
  });

  sendResponse(res, 200, "Share link revoked successfully", null);
});

const getSharedNoteByToken = asyncHandler(async (req, res) => {
  const token = sanitizeText(req.params.token, {
    field: "Share link token",
    minLength: 16,
    maxLength: 128,
  });

  const shareLink = await NoteShareLink.findOne({
    token,
    isActive: true,
  }).populate({
    path: "noteId",
    populate: {
      path: "owner",
      select: "name email",
    },
  });

  if (!shareLink || !shareLink.noteId) {
    throw new AppError("Shared note not found", 404);
  }

  if (shareLink.expiresAt && shareLink.expiresAt.getTime() <= Date.now()) {
    shareLink.isActive = false;
    await shareLink.save();
    throw new AppError("This share link has expired", 410);
  }

  if (shareLink.visibility === "private" && !req.user) {
    throw new AppError("Sign in to access this shared note", 401);
  }

  if (shareLink.visibility === "private") {
    const authorizedAccess = await NoteAccess.findOne({
      noteId: shareLink.noteId._id,
      userId: req.user._id,
    });

    if (!authorizedAccess) {
      throw new AppError("You do not have access to this shared note", 403);
    }
  }

  shareLink.lastAccessedAt = new Date();
  shareLink.accessCount = (shareLink.accessCount || 0) + 1;
  await shareLink.save();

  sendResponse(res, 200, "Shared note fetched successfully", {
    note: formatNote(shareLink.noteId, "Read Only"),
    shareLink: formatShareLink(shareLink),
  });
});

module.exports = {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteVersions,
  restoreNoteVersion,
  getNoteSharing,
  shareNote,
  getMyNoteInvitations,
  respondToNoteInvite,
  cancelNoteInvite,
  removeNoteCollaborator,
  getNoteShareLink,
  upsertNoteShareLink,
  revokeNoteShareLink,
  getSharedNoteByToken,
};
