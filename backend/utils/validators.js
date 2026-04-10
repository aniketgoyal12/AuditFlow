const mongoose = require("mongoose");
const AppError = require("./AppError");

const isEmail = (value = "") => /\S+@\S+\.\S+/.test(value);
const hasStrongPassword = (value = "") =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

const USER_ROLES = ["Admin", "Editor", "User"];
const USER_STATUSES = ["active", "inactive", "suspended"];
const NOTE_COLORS = ["primary", "error", "warning", "success", "purple", "info"];
const NOTE_ACCESS_LEVELS = ["Owner", "Editor", "Read Only"];
const THEMES = ["light", "dark", "auto"];
const LANGUAGES = ["en", "es", "fr", "de"];
const TIMEZONES = [
  "Asia/Calcutta",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length) {
    throw new AppError(`Missing required field(s): ${missing.join(", ")}`, 400);
  }
};

const sanitizeText = (
  value,
  { field = "Value", minLength = 1, maxLength = 255, allowEmpty = false, trim = true } = {}
) => {
  if (typeof value !== "string") {
    throw new AppError(`${field} must be a string`, 400);
  }

  const normalized = trim ? value.trim() : value;

  if (!allowEmpty && normalized.length < minLength) {
    throw new AppError(`${field} is required`, 400);
  }

  if (normalized.length > maxLength) {
    throw new AppError(`${field} must be ${maxLength} characters or fewer`, 400);
  }

  return normalized;
};

const sanitizeOptionalText = (value, options = {}) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return sanitizeText(value, {
    ...options,
    allowEmpty: true,
  });
};

const normalizeEmail = (value, field = "Email") => {
  const normalized = sanitizeText(value, {
    field,
    maxLength: 254,
  }).toLowerCase();

  if (!isEmail(normalized)) {
    throw new AppError("Please enter a valid email address", 400);
  }

  return normalized;
};

const sanitizeEnum = (value, allowedValues, field) => {
  if (!allowedValues.includes(value)) {
    throw new AppError(`${field} must be one of: ${allowedValues.join(", ")}`, 400);
  }

  return value;
};

const sanitizeStringArray = (
  value,
  { field = "Items", maxItems = 10, maxLength = 30 } = {}
) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError(`${field} must be an array`, 400);
  }

  const sanitized = [
    ...new Set(
      value
        .map((item) =>
          sanitizeText(String(item), {
            field,
            maxLength,
          })
        )
        .filter(Boolean)
    ),
  ];

  if (sanitized.length > maxItems) {
    throw new AppError(`${field} can contain at most ${maxItems} items`, 400);
  }

  return sanitized;
};

const sanitizeBooleanMap = (value, allowedKeys, field) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(`${field} must be an object`, 400);
  }

  const sanitized = {};

  Object.keys(value).forEach((key) => {
    if (!allowedKeys.includes(key)) {
      return;
    }

    if (typeof value[key] !== "boolean") {
      throw new AppError(`${field}.${key} must be a boolean`, 400);
    }

    sanitized[key] = value[key];
  });

  return sanitized;
};

const sanitizePreferences = (value = {}) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Preferences must be an object", 400);
  }

  const sanitized = {};

  if (value.theme !== undefined) {
    sanitized.theme = sanitizeEnum(value.theme, THEMES, "Theme");
  }

  if (value.language !== undefined) {
    sanitized.language = sanitizeEnum(value.language, LANGUAGES, "Language");
  }

  if (value.timezone !== undefined) {
    sanitized.timezone = sanitizeEnum(value.timezone, TIMEZONES, "Timezone");
  }

  if (value.dateFormat !== undefined) {
    sanitized.dateFormat = sanitizeEnum(value.dateFormat, DATE_FORMATS, "Date format");
  }

  return sanitized;
};

const assertObjectId = (value, field = "Identifier") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`${field} is invalid`, 400);
  }

  return value;
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  DATE_FORMATS,
  LANGUAGES,
  NOTE_ACCESS_LEVELS,
  NOTE_COLORS,
  THEMES,
  TIMEZONES,
  USER_ROLES,
  USER_STATUSES,
  assertObjectId,
  escapeRegex,
  hasStrongPassword,
  isEmail,
  normalizeEmail,
  requireFields,
  sanitizeBooleanMap,
  sanitizeEnum,
  sanitizeOptionalText,
  sanitizePreferences,
  sanitizeStringArray,
  sanitizeText,
};
