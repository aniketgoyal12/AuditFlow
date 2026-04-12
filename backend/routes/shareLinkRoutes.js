const express = require("express");

const { getSharedNoteByToken } = require("../controllers/noteController");
const { optionalProtect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:token", optionalProtect, getSharedNoteByToken);

module.exports = router;
