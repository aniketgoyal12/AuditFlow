const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require("../controllers/authController");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getUserProfile);
router.put("/me", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
