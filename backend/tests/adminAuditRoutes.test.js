process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-12345678901234567890";

const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/user", () => ({
  findById: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock("../models/Note", () => ({
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock("../models/auditlogs", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
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

const User = require("../models/user");
const { app } = require("../app");

const buildProtectedUserQuery = (user) => ({
  select: jest.fn().mockResolvedValue(user),
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("admin and audit route protections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks a regular user from reading another user's audit logs", async () => {
    const regularUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Regular User",
      email: "user@example.com",
      role: "User",
      status: "active",
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };

    User.findById.mockReturnValue(buildProtectedUserQuery(regularUser));

    const response = await request(app)
      .get("/api/audit-logs/user/507f1f77bcf86cd799439099")
      .set("Authorization", `Bearer ${signToken(regularUser._id)}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Not authorized/i);
  });

  it("prevents administrators from editing their own role or status", async () => {
    const adminUser = {
      _id: "507f1f77bcf86cd799439021",
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      status: "active",
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };

    User.findById
      .mockReturnValueOnce(buildProtectedUserQuery(adminUser))
      .mockResolvedValueOnce(adminUser);

    const response = await request(app)
      .put(`/api/admin/users/${adminUser._id}`)
      .set("Authorization", `Bearer ${signToken(adminUser._id)}`)
      .send({ status: "suspended" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/cannot change their own role or status/i);
  });

  it("allows an administrator to update another user's role and status", async () => {
    const adminUser = {
      _id: "507f1f77bcf86cd799439021",
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      status: "active",
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };
    const targetUser = {
      _id: "507f1f77bcf86cd799439022",
      name: "Editor User",
      email: "editor@example.com",
      role: "User",
      status: "inactive",
      save: jest.fn().mockResolvedValue(),
    };

    User.findById
      .mockReturnValueOnce(buildProtectedUserQuery(adminUser))
      .mockResolvedValueOnce(targetUser);

    const response = await request(app)
      .put(`/api/admin/users/${targetUser._id}`)
      .set("Authorization", `Bearer ${signToken(adminUser._id)}`)
      .send({ role: "Editor", status: "active" });

    expect(response.status).toBe(200);
    expect(targetUser.role).toBe("Editor");
    expect(targetUser.status).toBe("active");
    expect(targetUser.save).toHaveBeenCalled();
  });
});
