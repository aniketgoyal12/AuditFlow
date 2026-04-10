const jwt = require("jsonwebtoken");

const { getEnv } = require("../config/env");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, no token", 401);
  }

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, getEnv().jwtSecret);
  } catch (_error) {
    throw new AppError("Session expired or token is invalid", 401);
  }

  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user) {
    throw new AppError("Not authorized, user not found", 401);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError("Session expired. Please sign in again.", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Your account is not active. Contact an administrator.", 403);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError("Not authorized for this resource", 403);
  }

  next();
};

module.exports = { protect, authorize };
