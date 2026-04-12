const nodemailer = require("nodemailer");

const { getEnv } = require("../config/env");
const logger = require("./logger");

let cachedTransporter = null;
let hasLoggedFallback = false;

const createTransporter = () => {
  const { email } = getEnv();

  if (email.host && email.port) {
    return nodemailer.createTransport({
      host: email.host,
      port: email.port,
      secure: email.secure,
      auth: email.user ? { user: email.user, pass: email.password } : undefined,
    });
  }

  if (!hasLoggedFallback) {
    hasLoggedFallback = true;
    logger.warn("email.transport.fallback", {
      message:
        "SMTP credentials are not configured. Email notifications will be captured with Nodemailer's JSON transport until SMTP settings are provided.",
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }

  return cachedTransporter;
};

const sendEmailInBackground = ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    return;
  }

  const { email } = getEnv();

  setImmediate(async () => {
    try {
      await getTransporter().sendMail({
        from: email.from,
        to,
        subject,
        text,
        html,
      });

      logger.info("email.sent", {
        to,
        subject,
      });
    } catch (error) {
      logger.warn("email.send.failed", {
        to,
        subject,
        error,
      });
    }
  });
};

module.exports = {
  sendEmailInBackground,
};
