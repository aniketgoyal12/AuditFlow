const AuditLog = require("../models/auditlogs");
const logger = require("./logger");

const createAuditLog = async ({
  actorId,
  action,
  summary,
  target,
  status = "success",
  entityType,
  entityId,
  metadata,
  req,
}) => {
  try {
    await AuditLog.create({
      actor: actorId || null,
      action,
      summary,
      target,
      status,
      entityType,
      entityId,
      metadata,
      route: req?.originalUrl,
      method: req?.method,
      ipAddress: req?.clientIp,
      userAgent: req?.headers?.["user-agent"],
    });
  } catch (error) {
    logger.warn("audit.write.failed", {
      error,
      action,
      target,
    });
  }
};

module.exports = { createAuditLog };
