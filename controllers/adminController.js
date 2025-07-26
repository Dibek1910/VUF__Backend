const Team = require("../models/Team");
const User = require("../models/User");
const Match = require("../models/Match");

exports.getAdminDashboard = async (req, res) => {
  try {
    const [userStats, teamStats, matchStats, pendingRemovals] =
      await Promise.all([
        User.aggregate([
          {
            $group: {
              _id: "$role",
              count: { $sum: 1 },
              pendingCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$role", "Captain"] },
                        { $eq: ["$isApproved", false] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),
        Team.countDocuments(),
        Match.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Team.countDocuments({ removalRequested: { $ne: null } }),
      ]);

    const userStatsMap = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {});

    const matchStatsMap = matchStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role isApproved createdAt")
      .lean();

    const recentMatches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "teams",
        select: "name",
      })
      .lean();

    const dashboardData = {
      statistics: {
        totalUsers:
          (userStatsMap.Admin?.count || 0) +
          (userStatsMap.Captain?.count || 0) +
          (userStatsMap.Player?.count || 0),
        totalCaptains: userStatsMap.Captain?.count || 0,
        totalPlayers: userStatsMap.Player?.count || 0,
        pendingCaptains: userStatsMap.Captain?.pendingCount || 0,
        totalTeams: teamStats,
        totalMatches: Object.values(matchStatsMap).reduce(
          (sum, count) => sum + count,
          0
        ),
        liveMatches: matchStatsMap.Live || 0,
        upcomingMatches: matchStatsMap.Upcoming || 0,
        completedMatches: matchStatsMap.Completed || 0,
        pendingRemovals,
      },
      recentActivities: {
        recentUsers,
        recentMatches,
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(`[ADMIN] Get admin dashboard error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingCaptains = async (req, res) => {
  try {
    const pendingCaptains = await User.find({
      role: "Captain",
      isApproved: false,
    })
      .select("name email phone uniqueId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(pendingCaptains);
  } catch (error) {
    console.error(`[ADMIN] Get pending captains error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveCaptain = async (req, res) => {
  try {
    const { captainId } = req.body;

    const captain = await User.findByIdAndUpdate(
      captainId,
      { isApproved: true },
      { new: true }
    ).select("name email phone uniqueId role isApproved");

    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    res.json({ message: "Captain approved successfully", captain });
  } catch (error) {
    console.error(`[ADMIN] Approve captain error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectCaptain = async (req, res) => {
  try {
    const { captainId } = req.body;

    const captain = await User.findByIdAndDelete(captainId);

    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    res.json({ message: "Captain rejected successfully" });
  } catch (error) {
    console.error(`[ADMIN] Reject captain error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({
        path: "captainId",
        select: "name email phone uniqueId isApproved",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "removalRequested",
        select: "name email uniqueId",
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(teams);
  } catch (error) {
    console.error(`[ADMIN] Get all teams error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingRemovals = async (req, res) => {
  try {
    const pendingRemovals = await Team.find({
      removalRequested: { $ne: null },
    })
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "removalRequested",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(pendingRemovals);
  } catch (error) {
    console.error(`[ADMIN] Get pending removals error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approvePlayerRemoval = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team || !team.removalRequested) {
      return res
        .status(404)
        .json({ message: "Team or removal request not found" });
    }

    const playerToRemove = team.removalRequested;

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        $pull: { players: playerToRemove },
        $unset: { removalRequested: 1 },
      },
      { new: true }
    )
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      });

    res.json({
      message: "Player removal approved successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[ADMIN] Approve player removal error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectPlayerRemoval = async (req, res) => {
  try {
    const { teamId } = req.body;

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $unset: { removalRequested: 1 } },
      { new: true }
    )
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      });

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      message: "Player removal rejected successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[ADMIN] Reject player removal error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate({
        path: "teams",
        select: "name captainId",
        populate: {
          path: "captainId",
          select: "name email",
        },
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      })
      .sort({ matchDate: -1 })
      .lean();

    res.json(matches);
  } catch (error) {
    console.error(`[ADMIN] Get all matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone uniqueId role isApproved createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    console.error(`[ADMIN] Get all users error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete.role === "Admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      if (userToDelete.role === "Captain") {
        await Team.deleteMany({ captainId: userId }, { session });
      }

      if (userToDelete.role === "Player") {
        await Team.updateMany(
          { $or: [{ players: userId }, { invitedPlayers: userId }] },
          { $pull: { players: userId, invitedPlayers: userId } },
          { session }
        );
      }

      await User.findByIdAndDelete(userId, { session });

      await session.commitTransaction();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(`[ADMIN] Delete user error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const session = await Team.startSession();
    session.startTransaction();

    try {
      await Match.updateMany(
        { teams: teamId },
        { $pull: { teams: teamId } },
        { session }
      );

      await Team.findByIdAndDelete(teamId, { session });

      await session.commitTransaction();
      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(`[ADMIN] Delete team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
