const User = require("../models/user");
const { getEnv } = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");
const { createAuditLog } = require("../utils/auditLogger");
const { normalizeUserRole } = require("../utils/roles");
const {
  hasStrongPassword,
  normalizeEmail,
  requireFields,
  sanitizeBooleanMap,
  sanitizeOptionalText,
  sanitizePreferences,
  sanitizeText,
} = require("../utils/validators");

const NOTIFICATION_SETTING_KEYS = [
  "emailNotifications",
  "pushNotifications",
  "activityDigest",
  "securityAlerts",
  "teamUpdates",
];

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: normalizeUserRole(user.role),
  status: user.status,
  notificationSettings: user.notificationSettings,
  preferences: user.preferences,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const registerUser = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "email", "password"]);

  const name = sanitizeText(req.body.name, { field: "Name", maxLength: 80 });
  const email = normalizeEmail(req.body.email);
  const password = sanitizeText(req.body.password, {
    field: "Password",
    minLength: 8,
    maxLength: 128,
    trim: false,
  });
  const phone = sanitizeOptionalText(req.body.phone, {
    field: "Phone number",
    maxLength: 20,
  });

  if (!hasStrongPassword(password)) {
    throw new AppError(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      400
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: "user",
  });

  user.lastLoginAt = new Date();
  await user.save();

  await createAuditLog({
    actorId: user._id,
    action: "register",
    summary: `${user.name} created an account`,
    target: user.email,
    entityType: "User",
    entityId: user._id.toString(),
    req,
  });

  sendResponse(res, 201, "Registration successful", {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);

  const { authLockMinutes, authMaxAttempts } = getEnv();
  const email = normalizeEmail(req.body.email);
  const password = sanitizeText(req.body.password, {
    field: "Password",
    minLength: 1,
    maxLength: 128,
    trim: false,
  });
  const rememberMe = Boolean(req.body.rememberMe);
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil +passwordChangedAt"
  );

  if (user?.lockUntil && user.lockUntil.getTime() > Date.now()) {
    await createAuditLog({
      actorId: user._id,
      action: "login",
      summary: `Blocked login attempt for locked account ${email}`,
      target: email,
      status: "failed",
      entityType: "Auth",
      req,
      metadata: { lockUntil: user.lockUntil.toISOString() },
    });
    throw new AppError("Too many failed login attempts. Please try again later.", 429);
  }

  if (!user || !(await user.comparePassword(password))) {
    if (user) {
      const nextAttemptCount = (user.loginAttempts || 0) + 1;
      const shouldLockAccount = nextAttemptCount >= authMaxAttempts;
      user.loginAttempts = shouldLockAccount ? 0 : nextAttemptCount;
      user.lockUntil = shouldLockAccount
        ? new Date(Date.now() + authLockMinutes * 60 * 1000)
        : null;
      await user.save();
    }

    await createAuditLog({
      action: "login",
      summary: `Failed login attempt for ${email}`,
      target: email,
      status: "failed",
      entityType: "Auth",
      req,
      metadata: user
        ? {
            remainingAttempts: user.lockUntil ? 0 : Math.max(authMaxAttempts - user.loginAttempts, 0),
            lockedUntil: user.lockUntil?.toISOString() || null,
          }
        : undefined,
    });

    if (user?.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new AppError("Too many failed login attempts. Please try again later.", 429);
    }

    throw new AppError("Invalid email or password", 401);
  }

  if (user.status !== "active") {
    await createAuditLog({
      actorId: user._id,
      action: "login",
      summary: `Blocked login attempt for inactive account ${email}`,
      target: email,
      status: "failed",
      entityType: "Auth",
      req,
      metadata: { status: user.status },
    });
    throw new AppError("Your account is not active. Contact an administrator.", 403);
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await createAuditLog({
    actorId: user._id,
    action: "login",
    summary: `${user.name} signed in`,
    target: user.email,
    entityType: "Auth",
    req,
  });

  sendResponse(res, 200, "Login successful", {
    user: sanitizeUser(user),
    token: generateToken(user._id, {
      expiresIn: rememberMe ? "7d" : undefined,
    }),
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  await createAuditLog({
    actorId: req.user._id,
    action: "logout",
    summary: `${req.user.name} signed out`,
    target: req.user.email,
    entityType: "Auth",
    req,
  });

  sendResponse(res, 200, "Logout successful", null);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  sendResponse(res, 200, "Profile fetched successfully", user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { notificationSettings, preferences } = req.body;
  const name =
    req.body.name !== undefined
      ? sanitizeText(req.body.name, { field: "Name", maxLength: 80 })
      : undefined;
  const email = req.body.email !== undefined ? normalizeEmail(req.body.email) : undefined;
  const phone =
    req.body.phone !== undefined
      ? sanitizeOptionalText(req.body.phone, { field: "Phone number", maxLength: 20 })
      : undefined;

  if (email && email !== user.email) {
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      throw new AppError("Another user already uses this email address", 400);
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (notificationSettings) {
    const sanitizedNotificationSettings = sanitizeBooleanMap(
      notificationSettings,
      NOTIFICATION_SETTING_KEYS,
      "Notification settings"
    );
    user.notificationSettings = {
      ...(user.notificationSettings?.toObject?.() || user.notificationSettings || {}),
      ...sanitizedNotificationSettings,
    };
  }
  if (preferences) {
    const sanitizedPreferences = sanitizePreferences(preferences);
    user.preferences = {
      ...(user.preferences?.toObject?.() || user.preferences || {}),
      ...sanitizedPreferences,
    };
  }

  await user.save();

  await createAuditLog({
    actorId: user._id,
    action: "profile_update",
    summary: `${user.name} updated account settings`,
    target: user.email,
    entityType: "User",
    entityId: user._id.toString(),
    req,
  });

  sendResponse(res, 200, "Profile updated successfully", sanitizeUser(user));
});

const changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword", "confirmPassword"]);

  const currentPassword = sanitizeText(req.body.currentPassword, {
    field: "Current password",
    minLength: 1,
    maxLength: 128,
    trim: false,
  });
  const newPassword = sanitizeText(req.body.newPassword, {
    field: "New password",
    minLength: 8,
    maxLength: 128,
    trim: false,
  });
  const confirmPassword = sanitizeText(req.body.confirmPassword, {
    field: "Confirm password",
    minLength: 8,
    maxLength: 128,
    trim: false,
  });
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError("New password and confirmation do not match", 400);
  }

  if (newPassword === currentPassword) {
    throw new AppError("New password must be different from the current password", 400);
  }

  if (!hasStrongPassword(newPassword)) {
    throw new AppError(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      400
    );
  }

  user.password = newPassword;
  await user.save();

  await createAuditLog({
    actorId: user._id,
    action: "password_change",
    summary: `${user.name} changed their password`,
    target: user.email,
    entityType: "User",
    entityId: user._id.toString(),
    req,
  });

  sendResponse(res, 200, "Password updated successfully", null);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
