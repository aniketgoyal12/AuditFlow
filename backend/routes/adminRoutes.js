const express = require("express");

const {
  getAdminOverview,
  getAdminUsers,
  updateUserStatus,
} = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("admin"));
router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.put("/users/:id", updateUserStatus);

module.exports = router;
