const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log(
      `[AUTH] Authentication failed - No token provided: ${req.originalUrl}`
    );
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      console.log(
        `[AUTH] Authentication failed - Token is blacklisted: ${req.originalUrl}`
      );
      return res.status(401).json({ message: "Not authorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log(
        `[AUTH] Authentication failed - User not found: ${decoded.id}`
      );
      return res.status(401).json({ message: "User not found" });
    }

    // Check if token exists in user's tokens array
    const tokenExists = user.tokens.some((t) => t.token === token);
    if (!tokenExists) {
      console.log(
        `[AUTH] Authentication failed - Invalid token for user: ${decoded.id}`
      );
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error(`[AUTH] Authentication error:`, error);
    res.status(401).json({ message: "Not authorized" });
  }
};
