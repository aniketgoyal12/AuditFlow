const express = require("express");

const {
  getAdminOverview,
  getAdminUsers,
  updateUserStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("Admin"));
router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.put("/users/:id", updateUserStatus);

module.exports = router;
