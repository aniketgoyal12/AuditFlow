const request = require("supertest");

const BASE_ENV = {
  nodeEnv: "test",
  isProduction: false,
  isTest: true,
  port: 5000,
  mongoUri: "mongodb://127.0.0.1:27017/auditVault",
  jwtSecret: "test-jwt-secret-12345678901234567890",
  jwtExpiresIn: "12h",
  clientOrigins: ["http://localhost:3000"],
  appUrl: "http://localhost:3000",
  authMaxAttempts: 5,
  authLockMinutes: 15,
  logLevel: "info",
  email: {
    from: "AuditFlow <no-reply@example.com>",
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
  },
  seedAdmin: {
    name: "AuditFlow Admin",
    email: "",
    password: "",
  },
};

const loadApp = (envOverrides = {}) => {
  jest.resetModules();
  jest.doMock("../utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }));

  jest.doMock("../config/env", () => {
    const env = { ...BASE_ENV, ...envOverrides };
    return {
      getEnv: () => env,
      validateEnvironment: () => env,
    };
  });

  return require("../app").createApp();
};

describe("app configuration", () => {
  it("returns a success payload for the root route", async () => {
    const app = loadApp();

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/AuditFlow backend is running/i);
    expect(response.body.data.health).toBe("/api/health");
  });

  it("allows production preflight requests when no client origins are configured", async () => {
    const app = loadApp({
      nodeEnv: "production",
      isProduction: true,
      isTest: false,
      clientOrigins: [],
      appUrl: "",
    });

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://frontend.example.com");
  });

  it("treats localhost-only production CORS configuration as unconfigured", async () => {
    const app = loadApp({
      nodeEnv: "production",
      isProduction: true,
      isTest: false,
      clientOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
    });

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://frontend.example.com");
  });

  it("rejects origins outside the configured allowlist in production", async () => {
    const app = loadApp({
      nodeEnv: "production",
      isProduction: true,
      isTest: false,
      clientOrigins: ["https://app.example.com"],
      appUrl: "https://app.example.com",
    });

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Origin not allowed by CORS policy/i);
  });
});
