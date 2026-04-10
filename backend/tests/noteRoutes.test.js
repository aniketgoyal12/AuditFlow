process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-12345678901234567890";

const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/Note", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  deleteOne: jest.fn(),
}));

jest.mock("../models/NoteAccess", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  distinct: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
}));

jest.mock("../models/NoteInvite", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock("../models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../utils/auditLogger", () => ({
  createAuditLog: jest.fn().mockResolvedValue(),
}));
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const Note = require("../models/Note");
const NoteAccess = require("../models/NoteAccess");
const NoteInvite = require("../models/NoteInvite");
const User = require("../models/user");
const { app } = require("../app");

const authUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Alice Example",
  email: "alice@example.com",
  role: "User",
  status: "active",
  changedPasswordAfter: jest.fn().mockReturnValue(false),
};

const signToken = (id = authUser._id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

const buildProtectedUserQuery = (user = authUser) => ({
  select: jest.fn().mockResolvedValue(user),
});

const buildPopulatedNoteQuery = (note) => ({
  populate: jest.fn().mockResolvedValue(note),
});

describe("note routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockReturnValue(buildProtectedUserQuery());
  });

  it("rejects note creation without required content", async () => {
    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ title: "Quarterly plan" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Missing required field/i);
  });

  it("prevents read-only collaborators from updating notes", async () => {
    const note = {
      _id: "607f1f77bcf86cd799439012",
      title: "Shared note",
      content: "Read only content",
      owner: { _id: authUser._id, name: authUser.name },
      tags: [],
      color: "primary",
      collaborators: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(),
    };

    Note.findById.mockReturnValue(buildPopulatedNoteQuery(note));
    NoteAccess.findOne.mockResolvedValue({ accessLevel: "Read Only" });

    const response = await request(app)
      .put("/api/notes/607f1f77bcf86cd799439012")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ title: "Updated title" });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Not authorized to update this note/i);
  });

  it("creates a pending invite for a teammate", async () => {
    const note = {
      _id: "607f1f77bcf86cd799439012",
      title: "Shared note",
      owner: { _id: authUser._id, name: authUser.name, email: authUser.email },
      collaborators: 1,
      save: jest.fn().mockResolvedValue(),
    };

    Note.findById.mockReturnValue(buildPopulatedNoteQuery(note));
    NoteAccess.findOne
      .mockResolvedValueOnce({ accessLevel: "Owner" })
      .mockResolvedValueOnce(null);
    User.findOne.mockResolvedValue({
      _id: "507f1f77bcf86cd799439013",
      name: "Bob Reviewer",
      email: "bob@example.com",
      status: "active",
    });
    NoteInvite.findOneAndUpdate.mockResolvedValue({
      _id: "707f1f77bcf86cd799439013",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    const response = await request(app)
      .post("/api/notes/607f1f77bcf86cd799439012/share")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ email: "bob@example.com", accessLevel: "Editor" });

    expect(response.status).toBe(200);
    expect(NoteInvite.findOneAndUpdate).toHaveBeenCalled();
    expect(response.body.message).toMatch(/Invite sent successfully/i);
    expect(response.body.data.mode).toBe("invited");
    expect(response.body.data.invite.email).toBe("bob@example.com");
  });

  it("accepts a pending invite and grants note access", async () => {
    const note = {
      _id: "607f1f77bcf86cd799439012",
      title: "Security note",
      owner: { _id: "507f1f77bcf86cd799439099", name: "Owner Example", email: "owner@example.com" },
      collaborators: 1,
      save: jest.fn().mockResolvedValue(),
    };
    const invite = {
      _id: "707f1f77bcf86cd799439013",
      noteId: note._id,
      invitedEmail: authUser.email,
      invitedUserId: null,
      accessLevel: "Editor",
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      save: jest.fn().mockResolvedValue(),
    };

    NoteInvite.findById.mockResolvedValue(invite);
    Note.findById.mockReturnValue(buildPopulatedNoteQuery(note));
    NoteAccess.findOneAndUpdate.mockResolvedValue({});
    NoteAccess.countDocuments.mockResolvedValue(2);

    const response = await request(app)
      .post("/api/notes/invitations/707f1f77bcf86cd799439013/respond")
      .set("Authorization", `Bearer ${signToken()}`)
      .send({ decision: "accepted" });

    expect(response.status).toBe(200);
    expect(NoteAccess.findOneAndUpdate).toHaveBeenCalledWith(
      {
        noteId: note._id,
        userId: authUser._id,
      },
      expect.objectContaining({
        accessLevel: "Editor",
      }),
      expect.objectContaining({
        upsert: true,
      })
    );
    expect(invite.status).toBe("accepted");
    expect(note.collaborators).toBe(2);
    expect(response.body.data.accessLevel).toBe("Editor");
  });
});
