const User = require("../models/User");
const Team = require("../models/Team");
const Match = require("../models/Match");
const Transaction = require("../models/Transaction");

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

exports.getAllUsers = async (req, res) => {
  try {
    console.log(`[ADMIN] Get all users request by admin: ${req.user._id}`);

    const users = await User.find();

    // Remove passwords from response
    const usersResponse = users.map((user) => {
      const userCopy = user.toObject();
      delete userCopy.password;
      delete userCopy.tokens;
      return userCopy;
    });

    console.log(`[ADMIN] Retrieved ${users.length} users successfully`);
    res.json(usersResponse);
  } catch (error) {
    console.error(`[ADMIN] Get all users error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingCaptains = async (req, res) => {
  try {
    console.log(
      `[ADMIN] Get pending captains request by admin: ${req.user._id}`
    );

    const captains = await User.find({
      role: "Captain",
      subscriptionStatus: "Pending",
    });

    // Remove passwords from response
    const captainsResponse = captains.map((captain) => {
      const captainCopy = captain.toObject();
      delete captainCopy.password;
      delete captainCopy.tokens;
      return captainCopy;
    });

    console.log(
      `[ADMIN] Retrieved ${captains.length} pending captains successfully`
    );
    res.json(captainsResponse);
  } catch (error) {
    console.error(`[ADMIN] Get pending captains error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approvePlayerRemoval = async (req, res) => {
  try {
    const { teamId } = req.body;
    console.log(
      `[ADMIN] Player removal approval request for team: ${teamId} by admin: ${req.user._id}`
    );

    // Get team
    const team = await Team.findById(teamId);
    if (!team) {
      console.log(
        `[ADMIN] Player removal approval failed - Team not found: ${teamId}`
      );
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if removal is requested
    if (!team.removalRequested) {
      console.log(
        `[ADMIN] Player removal approval failed - No removal requested for team: ${teamId}`
      );
      return res.status(400).json({ message: "No removal requested" });
    }

    // Remove player
    const playerId = team.removalRequested;

    // Update team by removing player
    const updatedTeam = await Team.findOneAndUpdate(
      { _id: teamId },
      {
        $pull: { players: playerId },
        removalRequested: null,
      },
      { new: true }
    );

    console.log(
      `[ADMIN] Player removal approved successfully for player: ${playerId} from team: ${teamId}`
    );
    res.json({ message: "Player removal approved", team: updatedTeam });
  } catch (error) {
    console.error(`[ADMIN] Player removal approval error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    console.log(
      `[ADMIN] Get dashboard stats request by admin: ${req.user._id}`
    );

    // Get counts
    const users = await User.find();
    const teams = await Team.find();
    const matches = await Match.find();
    const transactions = await Transaction.find();

    // Calculate stats
    const userStats = {
      total: users.length,
      admins: users.filter((user) => user.role === "Admin").length,
      captains: users.filter((user) => user.role === "Captain").length,
      players: users.filter((user) => user.role === "Player").length,
    };

    const matchStats = {
      total: matches.length,
      upcoming: matches.filter((match) => match.status === "Upcoming").length,
      live: matches.filter((match) => match.status === "Live").length,
      completed: matches.filter((match) => match.status === "Completed").length,
    };

    const transactionStats = {
      total: transactions.length,
      pending: transactions.filter((tx) => tx.status === "Pending").length,
      completed: transactions.filter((tx) => tx.status === "Completed").length,
      failed: transactions.filter((tx) => tx.status === "Failed").length,
      totalAmount: transactions
        .filter((tx) => tx.status === "Completed")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
    };

    console.log(`[ADMIN] Dashboard stats retrieved successfully`);
    res.json({
      users: userStats,
      teams: { total: teams.length },
      matches: matchStats,
      transactions: transactionStats,
    });
  } catch (error) {
    console.error(`[ADMIN] Get dashboard stats error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
