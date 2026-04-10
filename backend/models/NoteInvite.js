const mongoose = require("mongoose");

const noteInviteSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },
    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ["Editor", "Read Only"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  { timestamps: true }
);

noteInviteSchema.index({ noteId: 1, invitedEmail: 1, status: 1 });
noteInviteSchema.index({ invitedEmail: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model("NoteInvite", noteInviteSchema);
