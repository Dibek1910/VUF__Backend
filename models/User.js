const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Captain", "Player"],
      required: true,
    },
    uniqueId: {
      type: String,
      unique: true,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "Admin" || this.role === "Player";
      },
    },
    subscriptionStatus: {
      type: String,
      enum: ["Active", "Inactive", "Expired", "Pending"],
      default: function () {
        return this.role === "Captain" ? "Inactive" : "Active";
      },
    },
    subscriptionExpiryDate: {
      type: Date,
      default: function () {
        if (this.role === "Captain") {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        return null;
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
      uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await mongoose.model("User").findOne({ uniqueId });
      if (!existingUser) {
        isUnique = true;
      }
    }

    this.uniqueId = uniqueId;
  }
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

UserSchema.statics.findByUniqueID = function (uniqueId) {
  return this.findOne({ uniqueId });
};

UserSchema.statics.addToken = async function (userId, token) {
  return this.findByIdAndUpdate(
    userId,
    { $push: { tokens: { token } } },
    { new: true }
  );
};

UserSchema.statics.removeToken = async function (userId, token) {
  return this.findByIdAndUpdate(
    userId,
    { $pull: { tokens: { token } } },
    { new: true }
  );
};

UserSchema.statics.updateSubscription = async function (
  userId,
  status,
  expiryDate
) {
  return this.findByIdAndUpdate(
    userId,
    {
      subscriptionStatus: status,
      subscriptionExpiryDate: expiryDate,
    },
    { new: true }
  );
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
