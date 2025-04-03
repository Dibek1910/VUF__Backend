const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    captainId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

// Static methods
Transaction.create = async (transactionData) => {
  const { captain, amount, status } = transactionData;

  const transaction = new Transaction({
    captainId: captain,
    amount,
    status,
  });

  await transaction.save();
  return transaction;
};

Transaction.findAll = async () => {
  return await Transaction.find().populate({
    path: "captainId",
    select: "id name email phone role uniqueId subscriptionStatus",
  });
};

module.exports = Transaction;
