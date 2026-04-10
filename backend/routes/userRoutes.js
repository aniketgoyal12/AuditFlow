const express = require("express");

const { getAdminUsers, updateUserStatus } = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("Admin"));
router.get("/", getAdminUsers);
router.put("/:id", updateUserStatus);

module.exports = router;
