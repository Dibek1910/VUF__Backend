const Team = require("../models/Team");
const User = require("../models/User");
const Match = require("../models/Match");

exports.getTeamInvitations = async (req, res) => {
  try {
    const playerId = req.user._id;

    const invitations = await Team.find({
      invitedPlayers: playerId,
      players: { $ne: playerId },
    })
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .select("name captainId createdAt");

    res.json(invitations);
  } catch (error) {
    console.error(`[PLAYER] Get team invitations error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptTeamInvitation = async (req, res) => {
  try {
    const { teamId } = req.body;
    const playerId = req.user._id;

    const existingTeam = await Team.findOne({ players: playerId });
    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "You are already part of a team" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (!team.invitedPlayers || !team.invitedPlayers.includes(playerId)) {
      return res
        .status(400)
        .json({ message: "You are not invited to this team" });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        $addToSet: { players: playerId },
        $pull: { invitedPlayers: playerId },
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
      message: "Team invitation accepted successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[PLAYER] Accept team invitation error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.declineTeamInvitation = async (req, res) => {
  try {
    const { teamId } = req.body;
    const playerId = req.user._id;

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $pull: { invitedPlayers: playerId } },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Team invitation declined successfully" });
  } catch (error) {
    console.error(`[PLAYER] Decline team invitation error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerTeam = async (req, res) => {
  try {
    const playerId = req.user._id;

    const team = await Team.findOne({ players: playerId })
      .populate({
        path: "captainId",
        select:
          "name email phone uniqueId subscriptionStatus subscriptionExpiryDate",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      });

    if (!team) {
      return res.status(404).json({ message: "You are not part of any team" });
    }

    res.json(team);
  } catch (error) {
    console.error(`[PLAYER] Get player team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerMatches = async (req, res) => {
  try {
    const playerId = req.user._id;

    const playerTeam = await Team.findOne({ players: playerId });
    if (!playerTeam) {
      return res.json([]);
    }

    const matches = await Match.find({ teams: playerTeam._id })
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      })
      .sort({ matchDate: -1 });

    res.json(matches);
  } catch (error) {
    console.error(`[PLAYER] Get player matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerDashboard = async (req, res) => {
  try {
    const playerId = req.user._id;

    const team = await Team.findOne({ players: playerId }).populate({
      path: "captainId",
      select: "name email",
    });

    const invitations = await Team.find({
      invitedPlayers: playerId,
      players: { $ne: playerId },
    }).countDocuments();

    let matches = [];
    if (team) {
      matches = await Match.find({ teams: team._id })
        .populate({
          path: "teams",
          select: "name",
        })
        .sort({ matchDate: -1 })
        .limit(5);
    }

    const dashboardData = {
      team: team || null,
      invitationsCount: invitations,
      recentMatches: matches,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(`[PLAYER] Get player dashboard error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
