const mongoose = require("mongoose");

const noteVersionSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    color: {
      type: String,
      enum: ["primary", "error", "warning", "success", "purple", "info"],
      default: "primary",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceAction: {
      type: String,
      enum: ["create", "update", "restore"],
      default: "update",
    },
  },
  { timestamps: true, versionKey: false }
);

noteVersionSchema.index({ noteId: 1, versionNumber: -1 }, { unique: true });

module.exports = mongoose.model("NoteVersion", noteVersionSchema);
