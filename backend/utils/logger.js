const { getEnv } = require("../config/env");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const serializeError = (error) => {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
};

const normalizeMeta = (meta = {}) =>
  Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [
      key,
      value instanceof Error ? serializeError(value) : value,
    ])
  );

const shouldLog = (level) => {
  const configuredLevel = levels[getEnv().logLevel] ?? levels.info;
  const requestedLevel = levels[level] ?? levels.info;
  return requestedLevel <= configuredLevel;
};

const log = (level, message, meta = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...normalizeMeta(meta),
  };

  const method = level === "debug" ? "log" : level;
  console[method](JSON.stringify(payload));
};

module.exports = {
  error: (message, meta = {}) => log("error", message, meta),
  warn: (message, meta = {}) => log("warn", message, meta),
  info: (message, meta = {}) => log("info", message, meta),
  debug: (message, meta = {}) => log("debug", message, meta),
  serializeError,
};
