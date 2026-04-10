const mongoose = require("mongoose");
const { getEnv } = require("./env");
const logger = require("../utils/logger");

mongoose.set("strictQuery", true);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { mongoUri } = getEnv();

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  logger.info("database.connected", {
    database: mongoose.connection.name,
  });

  return mongoose.connection;
};

module.exports = connectDB;
