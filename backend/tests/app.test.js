process.env.AUTH_MAX_ATTEMPTS = "5";
process.env.AUTH_LOCK_MINUTES = "15";

const request = require("supertest");

const ORIGINAL_ENV = { ...process.env };

const loadApp = () => {
  jest.resetModules();
  jest.doMock("../utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }));

  return require("../app").createApp();
};

describe("app configuration", () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "test",
      JWT_SECRET: "test-jwt-secret-12345678901234567890",
      AUTH_MAX_ATTEMPTS: "5",
      AUTH_LOCK_MINUTES: "15",
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns a success payload for the root route", async () => {
    const app = loadApp();

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/AuditFlow backend is running/i);
    expect(response.body.data.health).toBe("/api/health");
  });

  it("allows production preflight requests when no client origins are configured", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    delete process.env.CLIENT_URL;
    delete process.env.CLIENT_ORIGINS;

    const app = loadApp();

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://frontend.example.com");
  });

  it("treats localhost-only production CORS configuration as unconfigured", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.CLIENT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000";

    const app = loadApp();

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("https://frontend.example.com");
  });

  it("rejects origins outside the configured allowlist in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.CLIENT_ORIGINS = "https://app.example.com";

    const app = loadApp();

    const response = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://frontend.example.com")
      .set("Access-Control-Request-Method", "POST");

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Origin not allowed by CORS policy/i);
  });
});
