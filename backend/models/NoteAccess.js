const mongoose = require("mongoose");

const noteAccessSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ["Owner", "Editor", "Read Only"],
      required: true,
    },
  },
  { timestamps: true }
);

noteAccessSchema.index({ noteId: 1, userId: 1 }, { unique: true });
noteAccessSchema.index({ userId: 1, accessLevel: 1 });

module.exports = mongoose.model("NoteAccess", noteAccessSchema);
