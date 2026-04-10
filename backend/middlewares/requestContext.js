const crypto = require("crypto");

const requestContext = (req, _res, next) => {
  req.id = crypto.randomUUID();
  req.clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  req.requestStartedAt = Date.now();
  next();
};

module.exports = requestContext;
