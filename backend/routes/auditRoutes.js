const express = require("express");

const { getAuditLogs, getUserLogs } = require("../controllers/auditController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getAuditLogs);
router.get("/user/:userId", getUserLogs);

module.exports = router;
