const User = require("../models/User");

exports.approveCaptain = async (req, res) => {
  try {
    const { captainId } = req.body;
    console.log(
      `[ADMIN] Captain approval request for id: ${captainId} by admin: ${req.user._id}`
    );

    // Get captain
    const captain = await User.findById(captainId);
    if (!captain || captain.role !== "Captain") {
      console.log(
        `[ADMIN] Captain approval failed - Invalid captain ID: ${captainId}`
      );
      return res.status(400).json({ message: "Invalid captain ID" });
    }

    // Set expiry date to 1 year from now
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Update subscription status
    const updatedCaptain = await User.updateSubscription(
      captainId,
      "Active",
      expiryDate
    );

    console.log(
      `[ADMIN] Captain approved successfully: ${captainId}, expiry: ${expiryDate}`
    );
    res.json({
      message: "Captain approved successfully",
      captain: updatedCaptain,
    });
  } catch (error) {
    console.error(`[ADMIN] Captain approval error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
