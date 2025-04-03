const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.processPayment = async (req, res) => {
  try {
    const { captainId, amount } = req.body;
    console.log(
      `[PAYMENT] Process payment request for captain: ${captainId}, amount: ${amount}`
    );

    // Verify the captain exists
    const captain = await User.findById(captainId);
    if (!captain || captain.role !== "Captain") {
      console.log(
        `[PAYMENT] Payment failed - Invalid captain ID: ${captainId}`
      );
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
      console.log(
        `[PAYMENT] Payment successful for captain: ${captainId}, amount: ${amount}, transaction: ${transaction._id}`
      );
      res.json({ message: "Payment successful", transaction });
    } else {
      console.log(
        `[PAYMENT] Payment failed for captain: ${captainId}, amount: ${amount}, transaction: ${transaction._id}`
      );
      res.status(400).json({ message: "Payment failed", transaction });
    }
  } catch (error) {
    console.error(`[PAYMENT] Process payment error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    console.log(
      `[PAYMENT] Get all transactions request by admin: ${req.user._id}`
    );

    const transactions = await Transaction.findAll();

    console.log(
      `[PAYMENT] Retrieved ${transactions.length} transactions successfully`
    );
    res.json(transactions);
  } catch (error) {
    console.error(`[PAYMENT] Get transactions error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
