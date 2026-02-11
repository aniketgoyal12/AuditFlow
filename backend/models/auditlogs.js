const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    userId: String,
    action: String,
    route: String,
    method: String,
    before: Object,
    after: Object,
    timestamp: { type: Date, default: Date.now }
  },
  { versionKey: false }
)

module.export = mongoose.model("AuditLog", auditLogSchema);