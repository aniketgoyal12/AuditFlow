const rateLimit = require("express-rate-limit");

const buildLimiter = ({ windowMs, max, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({
        success: false,
        message,
        data: null,
      });
    },
  });

const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: "Too many requests from this IP. Please try again shortly.",
});

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts. Please wait before trying again.",
});

module.exports = {
  apiLimiter,
  authLimiter,
};
