const express = require("express");

const {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteSharing,
  shareNote,
  getMyNoteInvitations,
  respondToNoteInvite,
  cancelNoteInvite,
  removeNoteCollaborator,
} = require("../controllers/noteController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/invitations", getMyNoteInvitations);
router.post("/invitations/:inviteId/respond", respondToNoteInvite);
router.route("/").get(getNotes).post(createNote);
router.get("/:id/sharing", getNoteSharing);
router.post("/:id/share", shareNote);
router.delete("/:id/invites/:inviteId", cancelNoteInvite);
router.delete("/:id/collaborators/:userId", removeNoteCollaborator);
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
