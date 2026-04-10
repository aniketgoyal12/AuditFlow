const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.join(__dirname, "..", ".env"),
});

const parseOrigins = (value = "") =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getNodeEnv = () => process.env.NODE_ENV || "development";
const getDefaultMongoUri = (nodeEnv) =>
  nodeEnv === "production" ? "" : "mongodb://127.0.0.1:27017/auditVault";
const getDefaultJwtSecret = (nodeEnv) => {
  if (nodeEnv === "production") {
    return "";
  }

  if (nodeEnv === "test") {
    return "test-jwt-secret";
  }

  return "auditflow-local-dev-secret";
};

const getEnv = () => {
  const nodeEnv = getNodeEnv();

  return {
    nodeEnv,
    isProduction: nodeEnv === "production",
    isTest: nodeEnv === "test",
    port: Number(process.env.PORT || 5000),
    mongoUri: process.env.MONGO_URI || getDefaultMongoUri(nodeEnv),
    jwtSecret: process.env.JWT_SECRET || getDefaultJwtSecret(nodeEnv),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
    clientOrigins: parseOrigins(
      process.env.CLIENT_URL || process.env.CLIENT_ORIGINS || "http://localhost:3000"
    ),
    authMaxAttempts: Number(process.env.AUTH_MAX_ATTEMPTS || 5),
    authLockMinutes: Number(process.env.AUTH_LOCK_MINUTES || 15),
    logLevel: process.env.LOG_LEVEL || "info",
  };
};

const validateEnvironment = ({ requireDatabase = true } = {}) => {
  const env = getEnv();
  const missing = [];

  if (!env.jwtSecret) {
    missing.push("JWT_SECRET");
  }

  if (requireDatabase && !env.mongoUri) {
    missing.push("MONGO_URI");
  }

  if (missing.length > 0) {
    const error = new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
    error.statusCode = 500;
    throw error;
  }

  if (env.isProduction && env.jwtSecret.length < 32) {
    const error = new Error("JWT_SECRET must be at least 32 characters in production");
    error.statusCode = 500;
    throw error;
  }

  if (env.authMaxAttempts < 3 || env.authLockMinutes < 1) {
    const error = new Error("AUTH_MAX_ATTEMPTS and AUTH_LOCK_MINUTES must be valid numbers");
    error.statusCode = 500;
    throw error;
  }

  return env;
};

module.exports = {
  getEnv,
  validateEnvironment,
};
