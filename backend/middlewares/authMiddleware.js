const jwt = require("jsonwebtoken");

const { getEnv } = require("../config/env");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { hasUserRole, normalizeUserRole } = require("../utils/roles");

const resolveAuthenticatedUser = async (req, { required = true } = {}) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    if (required) {
      throw new AppError("Not authorized, no token", 401);
    }

    return null;
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, getEnv().jwtSecret);
  } catch (_error) {
    if (required) {
      throw new AppError("Session expired or token is invalid", 401);
    }

    return null;
  }

  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user) {
    if (required) {
      throw new AppError("Not authorized, user not found", 401);
    }

    return null;
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    if (required) {
      throw new AppError("Session expired. Please sign in again.", 401);
    }

    return null;
  }

  if (user.status !== "active") {
    if (required) {
      throw new AppError("Your account is not active. Contact an administrator.", 403);
    }

    return null;
  }

  user.role = normalizeUserRole(user.role);

  return user;
};

const protect = asyncHandler(async (req, _res, next) => {
  const user = await resolveAuthenticatedUser(req);
  req.user = user;
  next();
});

const optionalProtect = asyncHandler(async (req, _res, next) => {
  req.user = await resolveAuthenticatedUser(req, { required: false });
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!hasUserRole(req.user, roles)) {
    throw new AppError("Not authorized for this resource", 403);
  }

  next();
};

module.exports = { protect, optionalProtect, authorize };
