const express = require("express");

const { getAdminUsers, updateUserStatus } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("admin"));
router.get("/", getAdminUsers);
router.put("/:id", updateUserStatus);

module.exports = router;
