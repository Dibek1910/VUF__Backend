const Team = require("../models/Team");
const User = require("../models/User");
const Match = require("../models/Match");

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCaptains = await User.countDocuments({ role: "Captain" });
    const totalPlayers = await User.countDocuments({ role: "Player" });
    const pendingCaptains = await User.countDocuments({
      role: "Captain",
      isApproved: false,
    });
    const totalTeams = await Team.countDocuments();
    const totalMatches = await Match.countDocuments();
    const liveMatches = await Match.countDocuments({ status: "Live" });
    const upcomingMatches = await Match.countDocuments({ status: "Upcoming" });
    const completedMatches = await Match.countDocuments({
      status: "Completed",
    });
    const pendingRemovals = await Team.countDocuments({
      removalRequested: { $ne: null },
    });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role isApproved createdAt");

    const recentMatches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "teams",
        select: "name",
      });

    const dashboardData = {
      statistics: {
        totalUsers,
        totalCaptains,
        totalPlayers,
        pendingCaptains,
        totalTeams,
        totalMatches,
        liveMatches,
        upcomingMatches,
        completedMatches,
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
      .sort({ createdAt: -1 });

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
      .sort({ createdAt: -1 });

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
      .sort({ updatedAt: -1 });

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
      .sort({ matchDate: -1 });

    res.json(matches);
  } catch (error) {
    console.error(`[ADMIN] Get all matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { team1Id, team2Id, matchDate, location, description } = req.body;

    const team1 = await Team.findById(team1Id);
    const team2 = await Team.findById(team2Id);

    if (!team1 || !team2) {
      return res.status(404).json({ message: "One or both teams not found" });
    }

    if (team1Id === team2Id) {
      return res
        .status(400)
        .json({ message: "Cannot create match between same team" });
    }

    const match = new Match({
      teams: [team1Id, team2Id],
      matchDate: matchDate ? new Date(matchDate) : new Date(),
      location: location || "TBD",
      description: description || "",
      status: "Upcoming",
      scores: [
        { teamId: team1Id, score: 0 },
        { teamId: team2Id, score: 0 },
      ],
    });

    await match.save();

    const populatedMatch = await Match.findById(match._id)
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      });

    res
      .status(201)
      .json({ message: "Match created successfully", match: populatedMatch });
  } catch (error) {
    console.error(`[ADMIN] Create match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMatchScore = async (req, res) => {
  try {
    const { matchId, teamId, score } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const scoreIndex = match.scores.findIndex(
      (s) => s.teamId.toString() === teamId
    );
    if (scoreIndex === -1) {
      return res.status(404).json({ message: "Team not found in this match" });
    }

    match.scores[scoreIndex].score = score;
    match.status = "Live";

    await match.save();

    const updatedMatch = await Match.findById(matchId)
      .populate({
        path: "teams",
        select: "name",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      });

    res.json({
      message: "Match score updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error(`[ADMIN] Update match score error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const { matchId, status } = req.body;

    const validStatuses = ["Upcoming", "Live", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid match status" });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    )
      .populate({
        path: "teams",
        select: "name",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      });

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({
      message: "Match status updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error(`[ADMIN] Update match status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone uniqueId role isApproved createdAt")
      .sort({ createdAt: -1 });

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

    if (userToDelete.role === "Captain") {
      await Team.deleteMany({ captainId: userId });
    }

    if (userToDelete.role === "Player") {
      await Team.updateMany(
        { $or: [{ players: userId }, { invitedPlayers: userId }] },
        { $pull: { players: userId, invitedPlayers: userId } }
      );
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
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

    await Match.updateMany({ teams: teamId }, { $pull: { teams: teamId } });

    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(`[ADMIN] Delete team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
