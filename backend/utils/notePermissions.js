const AppError = require("./AppError");

const STORED_NOTE_PERMISSIONS = ["Owner", "Editor", "Read Only"];
const NOTE_PERMISSION_ALIASES = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Read Only",
  "read only": "Read Only",
  readonly: "Read Only",
  Owner: "Owner",
  Editor: "Editor",
  Viewer: "Read Only",
  "Read Only": "Read Only",
};

const NOTE_PERMISSION_LABELS = {
  Owner: "Owner",
  Editor: "Editor",
  "Read Only": "Viewer",
};

const NOTE_PERMISSION_SLUGS = {
  Owner: "owner",
  Editor: "editor",
  "Read Only": "viewer",
};

const normalizePermissionKey = (value) => String(value || "").trim();

const toStoredNotePermission = (value, { field = "Access level", allowOwner = true } = {}) => {
  const normalizedKey = normalizePermissionKey(value);
  const loweredKey = normalizedKey.toLowerCase();
  const storedPermission =
    NOTE_PERMISSION_ALIASES[normalizedKey] || NOTE_PERMISSION_ALIASES[loweredKey];

  if (!storedPermission) {
    throw new AppError(`${field} must be one of: owner, editor, viewer`, 400);
  }

  if (!allowOwner && storedPermission === "Owner") {
    throw new AppError(`${field} cannot be owner`, 400);
  }

  return storedPermission;
};

const getNotePermissionLabel = (value) =>
  NOTE_PERMISSION_LABELS[toStoredNotePermission(value)] || "Viewer";

const getNotePermissionSlug = (value) => NOTE_PERMISSION_SLUGS[toStoredNotePermission(value)] || "viewer";

const isNoteOwnerPermission = (value) => toStoredNotePermission(value) === "Owner";
const canEditNote = (value) => toStoredNotePermission(value) !== "Read Only";

module.exports = {
  STORED_NOTE_PERMISSIONS,
  canEditNote,
  getNotePermissionLabel,
  getNotePermissionSlug,
  isNoteOwnerPermission,
  toStoredNotePermission,
};
