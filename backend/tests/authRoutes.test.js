process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-12345678901234567890";
process.env.AUTH_MAX_ATTEMPTS = "5";
process.env.AUTH_LOCK_MINUTES = "15";

const request = require("supertest");

jest.mock("../models/user", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock("../utils/generateToken", () => jest.fn(() => "signed-token"));
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
const generateToken = require("../utils/generateToken");
const { app } = require("../app");

const buildSelectableQuery = (value) => ({
  select: jest.fn().mockResolvedValue(value),
});

const buildUser = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  name: "Alice Example",
  email: "alice@example.com",
  phone: "",
  role: "User",
  status: "active",
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: true,
    activityDigest: false,
    securityAlerts: true,
    teamUpdates: true,
  },
  preferences: {
    theme: "light",
    language: "en",
    timezone: "Asia/Calcutta",
    dateFormat: "DD/MM/YYYY",
  },
  createdAt: new Date("2026-04-01T00:00:00.000Z"),
  lastLoginAt: null,
  loginAttempts: 0,
  lockUntil: null,
  comparePassword: jest.fn().mockResolvedValue(true),
  save: jest.fn().mockResolvedValue(),
  changedPasswordAfter: jest.fn().mockReturnValue(false),
  ...overrides,
});

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers the first user as an administrator", async () => {
    const newUser = buildUser({ role: "Admin" });
    User.findOne.mockResolvedValue(null);
    User.countDocuments.mockResolvedValue(0);
    User.create.mockResolvedValue(newUser);

    const response = await request(app).post("/api/auth/register").send({
      name: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });

    expect(response.status).toBe(201);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "Admin",
        email: "alice@example.com",
      })
    );
    expect(newUser.save).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledWith(newUser._id);
    expect(response.body.data.user.role).toBe("Admin");
  });

  it("rejects weak registration passwords", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Weak User",
      email: "weak@example.com",
      password: "weakpass",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Password must be at least 8 characters/i);
  });

  it("logs in and extends token lifetime when remember me is enabled", async () => {
    const user = buildUser();
    User.findOne.mockReturnValue(buildSelectableQuery(user));

    const response = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "Password1",
      rememberMe: true,
    });

    expect(response.status).toBe(200);
    expect(user.comparePassword).toHaveBeenCalledWith("Password1");
    expect(user.save).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledWith(user._id, { expiresIn: "7d" });
    expect(response.body.data.token).toBe("signed-token");
  });

  it("locks an account after the configured number of failed attempts", async () => {
    const user = buildUser({
      comparePassword: jest.fn().mockResolvedValue(false),
      loginAttempts: 4,
    });
    User.findOne.mockReturnValue(buildSelectableQuery(user));

    const response = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "WrongPassword1",
    });

    expect(response.status).toBe(429);
    expect(user.save).toHaveBeenCalled();
    expect(user.lockUntil).toBeInstanceOf(Date);
    expect(response.body.message).toMatch(/Too many failed login attempts/i);
  });
});
