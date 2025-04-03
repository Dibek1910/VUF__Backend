exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(
        `[AUTH] Authorization failed - User ${req.user._id} with role ${
          req.user.role
        } attempted to access ${req.originalUrl} (required roles: ${roles.join(
          ", "
        )})`
      );
      return res
        .status(403)
        .json({ message: "Not authorized to access this route" });
    }
    next();
  };
};
