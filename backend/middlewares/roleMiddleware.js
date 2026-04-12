    
const AppError = require("../utils/AppError");
const { hasUserRole, normalizeUserRole } = require("../utils/roles");

const requireRole = (...roles) => {
  const normalizedRoles = roles.map((role) => normalizeUserRole(role));

  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Authentication is required", 401);
    }

    if (!hasUserRole(req.user, normalizedRoles)) {
      throw new AppError("Not authorized for this resource", 403);
    }

    next();
  };
};

module.exports = {
  requireRole,
};
