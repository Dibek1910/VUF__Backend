const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.processPayment = async (req, res) => {
  try {
    const { captainId, amount } = req.body;

    // Verify the captain exists
    const captain = await User.findById(captainId);
    if (!captain || captain.role !== "Captain") {
      return res.status(400).json({ message: "Invalid captain ID" });
    }

    // Dummy payment processing
    const success = Math.random() < 0.9; // 90% success rate

    // Create transaction
    const transaction = await Transaction.create({
      captain: captainId,
      amount,
      status: success ? "Completed" : "Failed",
    });

    // If payment is successful, update captain's subscription status
    if (success) {
      await User.updateSubscription(captainId, "Pending", null);
      res.json({ message: "Payment successful", transaction });
    } else {
      res.status(400).json({ message: "Payment failed", transaction });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
