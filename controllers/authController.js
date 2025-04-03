const bcrypt = require("bcryptjs");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const { generateToken } = require("../config/jwt");

exports.register = async (req, res) => {
  try {
    console.log(`[AUTH] Register attempt for email: ${req.body.email}`);
    const { name, email, phone, role, password } = req.body;

    // Check if user already exists
    let user = await User.findByEmail(email);
    if (user) {
      console.log(`[AUTH] Registration failed - User already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique ID
    const uniqueId = Math.random().toString(36).substring(7);

    // Create user
    user = await User.create({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
      uniqueId,
    });

    // Generate token
    const token = generateToken(user);

    // Add token to user
    await User.addToken(user._id, token);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    console.log(
      `[AUTH] User registered successfully: ${email}, role: ${role}, id: ${user._id}`
    );
    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error(`[AUTH] Registration error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    console.log(`[AUTH] Login attempt for email: ${req.body.email}`);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`[AUTH] Login failed - Invalid credentials for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH] Login failed - Invalid password for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Add token to user
    await User.addToken(user._id, token);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    console.log(
      `[AUTH] User logged in successfully: ${email}, role: ${user.role}, id: ${user._id}`
    );
    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error(`[AUTH] Login error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    console.log(`[AUTH] Logout attempt for user: ${req.user._id}`);

    // Get token from request
    const token = req.headers.authorization.split(" ")[1];

    // Remove token from user
    await User.removeToken(req.user._id, token);

    // Add token to blacklist
    await TokenBlacklist.add(token);

    console.log(`[AUTH] User logged out successfully: ${req.user._id}`);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`[AUTH] Logout error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log(`[AUTH] Get profile request for user: ${req.user._id}`);

    // Remove sensitive data from response
    const userResponse = req.user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    console.log(
      `[AUTH] Profile retrieved successfully for user: ${req.user._id}`
    );
    res.status(200).json(userResponse);
  } catch (error) {
    console.error(`[AUTH] Get profile error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log(`[AUTH] Update profile request for user: ${req.user._id}`);
    const { name, email, phone } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    );

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    console.log(
      `[AUTH] Profile updated successfully for user: ${req.user._id}`
    );
    res.status(200).json(userResponse);
  } catch (error) {
    console.error(`[AUTH] Update profile error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
