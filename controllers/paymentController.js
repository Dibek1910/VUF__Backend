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

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[PAYMENT] Get transaction by ID request for transaction: ${id} by user: ${req.user._id}`
    );

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      console.log(
        `[PAYMENT] Get transaction failed - Transaction not found: ${id}`
      );
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if user is admin or the captain of the transaction
    if (
      req.user.role !== "Admin" &&
      transaction.captainId.toString() !== req.user._id.toString()
    ) {
      console.log(
        `[PAYMENT] Get transaction failed - Not authorized: User ${req.user._id} is not authorized to view transaction ${id}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    console.log(`[PAYMENT] Transaction retrieved successfully: ${id}`);
    res.json(transaction);
  } catch (error) {
    console.error(`[PAYMENT] Get transaction by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaptainTransactions = async (req, res) => {
  try {
    console.log(
      `[PAYMENT] Get captain transactions request by captain: ${req.user._id}`
    );

    // Check if user is a captain
    if (req.user.role !== "Captain") {
      console.log(
        `[PAYMENT] Get captain transactions failed - Not a captain: User ${req.user._id}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    const transactions = await Transaction.findByCaptain(req.user._id);

    console.log(
      `[PAYMENT] Retrieved ${transactions.length} transactions for captain: ${req.user._id} successfully`
    );
    res.json(transactions);
  } catch (error) {
    console.error(`[PAYMENT] Get captain transactions error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    console.log(
      `[PAYMENT] Update transaction status request for transaction: ${transactionId}, status: ${status}`
    );

    // Check if user is admin
    if (req.user.role !== "Admin") {
      console.log(
        `[PAYMENT] Update transaction status failed - Not authorized: User ${req.user._id} is not an admin`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update transaction status
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    ).populate({
      path: "captainId",
      select: "id name email phone role uniqueId subscriptionStatus",
    });

    console.log(
      `[PAYMENT] Transaction status updated successfully for transaction: ${transactionId} to ${status}`
    );
    res.json(updatedTransaction);
  } catch (error) {
    console.error(`[PAYMENT] Update transaction status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
