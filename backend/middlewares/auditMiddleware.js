const AuditLog = require("../models/auditlogs")
const User = require("../models/user")

const auditMiddleware = async (req, res, next) => {
  if (!["POST", "PUT", "DELETE"].includes(req.method)) {
    return next()
  }

  let beforeData = null

  if (req.params.id) {
    beforeData = await User.findById(req.params.id)
  }

  res.on("finish", async () => {
    let afterData = null

    if (req.params.id && req.method !== "DELETE") {
      afterData = await User.findById(req.params.id)
    }

    await AuditLog.create({
      userId: "demo-user",
      action: req.method,
      route: req.originalUrl,
      method: req.method,
      before: beforeData,
      after: afterData
    })
  })

  next()
}

module.exports = auditMiddleware
