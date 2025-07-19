const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenBlacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d",
  },
});

const TokenBlacklist = mongoose.model("TokenBlacklist", TokenBlacklistSchema);

TokenBlacklist.isBlacklisted = async (token) => {
  const blacklistedToken = await TokenBlacklist.findOne({ token });
  return !!blacklistedToken;
};

TokenBlacklist.add = async (token) => {
  const blacklistedToken = new TokenBlacklist({ token });
  await blacklistedToken.save();
  return blacklistedToken;
};

module.exports = TokenBlacklist;
