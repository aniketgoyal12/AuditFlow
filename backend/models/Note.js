const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    color: {
      type: String,
      enum: ["primary", "error", "warning", "success", "purple", "info"],
      default: "primary",
    },
    collaborators: { type: Number, default: 0 },
    lastViewedAt: Date,
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text", tags: "text" });
noteSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
