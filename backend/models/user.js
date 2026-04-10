const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },
    role: {
      type: String,
      enum: ["Admin", "Editor", "User"],
      default: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      activityDigest: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true },
      teamUpdates: { type: Boolean, default: true },
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "auto"], default: "light" },
      language: { type: String, enum: ["en", "es", "fr", "de"], default: "en" },
      timezone: {
        type: String,
        enum: [
          "Asia/Calcutta",
          "America/New_York",
          "America/Chicago",
          "America/Los_Angeles",
        ],
        default: "Asia/Calcutta",
      },
      dateFormat: {
        type: String,
        enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
        default: "DD/MM/YYYY",
      },
    },
    lastLoginAt: Date,
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(JWTTimestamp) {
  if (!this.passwordChangedAt || !JWTTimestamp) {
    return false;
  }

  return this.passwordChangedAt.getTime() / 1000 > JWTTimestamp;
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.passwordChangedAt;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
