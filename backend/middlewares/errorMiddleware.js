const { getEnv } = require("../config/env");
const AppError = require("../utils/AppError");
const { sendResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const normalizeError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error.name === "CastError") {
    return new AppError(`Invalid ${error.path}`, 400);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "resource";
    return new AppError(`A record with this ${field} already exists`, 409);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors || {})
      .map((entry) => entry.message)
      .join(", ");
    return new AppError(message || "Validation failed", 400);
  }

  if (error.type === "entity.parse.failed") {
    return new AppError("Request body contains invalid JSON", 400);
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return new AppError("Session expired or token is invalid", 401);
  }

  return new AppError(error.message || "Internal server error", error.statusCode || 500);
};

const errorHandler = (error, req, res, _next) => {
  const normalizedError = normalizeError(error);
  const { isProduction } = getEnv();

  logger.error("request.failed", {
    requestId: req.id,
    method: req.method,
    route: req.originalUrl,
    statusCode: normalizedError.statusCode || 500,
    error: normalizedError,
  });

  sendResponse(
    res,
    normalizedError.statusCode || 500,
    normalizedError.message || "Internal server error",
    {
      requestId: req.id,
      ...(isProduction ? {} : { stack: normalizedError.stack }),
    }
  );
};

module.exports = { notFound, errorHandler };
