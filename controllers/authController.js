const bcrypt = require("bcryptjs");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const { generateToken } = require("../config/jwt");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = await User.create({
      name,
      email,
      phone,
      role,
      password,
    });

    const token = generateToken(user);

    await User.addToken(user._id, token);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error(`[AUTH] Registration error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    await User.addToken(user._id, token);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error(`[AUTH] Login error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await User.removeToken(req.user._id, token);

    await TokenBlacklist.add(token);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`[AUTH] Logout error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error(`[AUTH] Get profile error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error(`[AUTH] Update profile error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
