const cors = require("cors");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");

const connectDB = require("./config/db");
const { getEnv, validateEnvironment } = require("./config/env");
const { errorHandler, notFound } = require("./middlewares/errorMiddleware");
const { apiLimiter } = require("./middlewares/rateLimitMiddleware");
const requestContext = require("./middlewares/requestContext");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const auditRoutes = require("./routes/auditRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const shareLinkRoutes = require("./routes/shareLinkRoutes");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

const LOCAL_CLIENT_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const hasOnlyLocalClientOrigins = (origins = []) =>
  origins.length > 0 && origins.every((origin) => LOCAL_CLIENT_ORIGINS.has(origin));

const buildCorsOptions = () => {
  const { clientOrigins, isProduction } = getEnv();
  const allowAnyOrigin = clientOrigins.length === 0 || (isProduction && hasOnlyLocalClientOrigins(clientOrigins));

  if (isProduction && clientOrigins.length > 0 && hasOnlyLocalClientOrigins(clientOrigins)) {
    logger.warn("cors.local_only_allowlist_ignored", {
      clientOrigins,
      message:
        "Ignoring localhost-only CORS origins in production. Set CLIENT_ORIGINS to your deployed frontend URL(s) to enforce a strict allowlist.",
    });
  }

  return {
    origin(origin, callback) {
      if (!origin || allowAnyOrigin || clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new AppError(`Origin not allowed by CORS policy: ${origin}`, 403));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86400,
  };
};

const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(cors(buildCorsOptions()));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(requestContext);
  app.use("/api", apiLimiter);
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Request-Id", req.id);
    next();
  });

  app.use((req, res, next) => {
    res.on("finish", () => {
      if (req.originalUrl === "/api/health") {
        return;
      }

      logger.info("request.completed", {
        requestId: req.id,
        method: req.method,
        route: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.clientIp,
        durationMs: Date.now() - req.requestStartedAt,
      });
    });

    next();
  });

  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "AuditFlow backend is running",
      data: {
        health: "/api/health",
        requestId: req.id,
      },
    });
  });

  app.get("/api/health", (req, res) => {
    const { nodeEnv } = getEnv();

    res.json({
      success: true,
      message: "AuditFlow backend is healthy",
      data: {
        uptime: process.uptime(),
        environment: nodeEnv,
        requestId: req.id,
      },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/audit-logs", auditRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/share-links", shareLinkRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = createApp();
let server;

const shutdown = (signal) => {
  if (!server) {
    process.exit(0);
    return;
  }

  logger.info("server.shutdown.started", { signal });

  server.close(() => {
    logger.info("server.shutdown.completed", { signal });
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("server.shutdown.timeout", { signal });
    process.exit(1);
  }, 10000).unref();
};

const startServer = async () => {
  const env = validateEnvironment();

  await connectDB();

  server = app.listen(env.port, () => {
    logger.info("server.started", {
      port: env.port,
      environment: env.nodeEnv,
    });
  });

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.once(signal, () => shutdown(signal));
  });

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    logger.error("server.start.failed", { error });
    process.exit(1);
  });
}

module.exports = {
  app,
  createApp,
  startServer,
};
