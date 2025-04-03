const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Admin", "Captain", "Player"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["Pending", "Active", "Inactive"],
      default: "Inactive",
    },
    subscriptionExpiryDate: {
      type: Date,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// Static methods
User.findById = async (id) => {
  return await User.findOne({ _id: id });
};

User.findByEmail = async (email) => {
  return await User.findOne({ email });
};

User.findByUniqueID = async (uniqueId) => {
  return await User.findOne({ uniqueId });
};

User.create = async (userData) => {
  const { name, email, phone, role, password, uniqueId } = userData;
  const user = new User({
    name,
    email,
    phone,
    role,
    password,
    uniqueId,
    subscriptionStatus: "Inactive",
  });
  await user.save();
  return user;
};

User.updateSubscription = async (id, status, expiryDate) => {
  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      subscriptionStatus: status,
      subscriptionExpiryDate: expiryDate,
    },
    { new: true }
  );
  return user;
};

User.addToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { $push: { tokens: { token } } });
};

User.removeToken = async (userId, token) => {
  await User.findByIdAndUpdate(userId, { $pull: { tokens: { token } } });
};

User.findByToken = async (token) => {
  return await User.findOne({
    "tokens.token": token,
  });
};

module.exports = User;
