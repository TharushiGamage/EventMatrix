const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"];
    const userName = req.headers["x-user-name"];

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User role is required.",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${allowedRoles.join(
          " or "
        )} can perform this action.`,
      });
    }

    req.user = {
      role: userRole,
      name: userName || "",
    };

    next();
  };
};

module.exports = {
  requireRole,
};