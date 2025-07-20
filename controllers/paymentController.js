const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.processPayment = async (req, res) => {
  try {
    const { captainId, amount } = req.body;

    const captain = await User.findById(captainId);
    if (!captain || captain.role !== "Captain") {
      return res.status(400).json({ message: "Invalid captain ID" });
    }

    const success = Math.random() < 0.9;

    const transaction = await Transaction.create({
      captain: captainId,
      amount,
      status: success ? "Completed" : "Failed",
    });

    if (success) {
      await User.updateSubscription(captainId, "Pending", null);

      res.json({ message: "Payment successful", transaction });
    } else {
      res.status(400).json({ message: "Payment failed", transaction });
    }
  } catch (error) {
    console.error(`[PAYMENT] Process payment error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();

    res.json(transactions);
  } catch (error) {
    console.error(`[PAYMENT] Get transactions error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (
      req.user.role !== "Admin" &&
      transaction.captainId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(transaction);
  } catch (error) {
    console.error(`[PAYMENT] Get transaction by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaptainTransactions = async (req, res) => {
  try {
    if (req.user.role !== "Captain") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const transactions = await Transaction.findByCaptain(req.user._id);

    res.json(transactions);
  } catch (error) {
    console.error(`[PAYMENT] Get captain transactions error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    ).populate({
      path: "captainId",
      select: "id name email phone role uniqueId subscriptionStatus",
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error(`[PAYMENT] Update transaction status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
