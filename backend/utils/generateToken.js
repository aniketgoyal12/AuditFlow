const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

const generateToken = (id, options = {}) =>
  jwt.sign({ id }, getEnv().jwtSecret, {
    expiresIn: options.expiresIn || getEnv().jwtExpiresIn,
  });

module.exports = generateToken;
