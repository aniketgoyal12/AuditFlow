const connectDB = require("../config/db");
const { getEnv, validateEnvironment } = require("../config/env");
const User = require("../models/user");
const { hasStrongPassword } = require("../utils/validators");

const seedAdmin = async () => {
  validateEnvironment();
  await connectDB();

  const { seedAdmin: adminConfig } = getEnv();

  if (!adminConfig.email || !adminConfig.password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set before running the admin seed script"
    );
  }

  if (!hasStrongPassword(adminConfig.password)) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 8 characters and include uppercase, lowercase, and a number"
    );
  }

  const existingAdmin = await User.findOne({ email: adminConfig.email.toLowerCase() }).select(
    "+password"
  );

  if (existingAdmin) {
    existingAdmin.name = adminConfig.name;
    existingAdmin.password = adminConfig.password;
    existingAdmin.role = "admin";
    existingAdmin.status = "active";
    existingAdmin.lastLoginAt = existingAdmin.lastLoginAt || new Date();
    await existingAdmin.save();
    console.log(`Updated admin user: ${existingAdmin.email}`);
    return;
  }

  const createdAdmin = await User.create({
    name: adminConfig.name,
    email: adminConfig.email.toLowerCase(),
    password: adminConfig.password,
    role: "admin",
    status: "active",
    lastLoginAt: new Date(),
  });

  console.log(`Created admin user: ${createdAdmin.email}`);
};

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
