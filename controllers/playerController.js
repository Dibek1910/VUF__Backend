const Team = require("../models/Team");
const User = require("../models/User");
const Match = require("../models/Match");

exports.getTeamInvitations = async (req, res) => {
  try {
    const playerId = req.user._id;
    console.log(`[PLAYER] Get team invitations for player: ${playerId}`);

    const invitations = await Team.find({
      invitedPlayers: playerId,
      players: { $ne: playerId },
    })
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .select("name captainId createdAt");

    console.log(
      `[PLAYER] Found ${invitations.length} invitations for player: ${playerId}`
    );
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
    console.log(
      `[PLAYER] Accept team invitation - Team: ${teamId}, Player: ${playerId}`
    );

    const existingTeam = await Team.findOne({ players: playerId });
    if (existingTeam) {
      console.log(`[PLAYER] Player already in team: ${existingTeam._id}`);
      return res
        .status(400)
        .json({ message: "You are already part of a team" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[PLAYER] Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    if (!team.invitedPlayers || !team.invitedPlayers.includes(playerId)) {
      console.log(`[PLAYER] Player not invited to team: ${teamId}`);
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

    console.log(
      `[PLAYER] Player accepted team invitation successfully: ${playerId} to team: ${teamId}`
    );
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
    console.log(
      `[PLAYER] Decline team invitation - Team: ${teamId}, Player: ${playerId}`
    );

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $pull: { invitedPlayers: playerId } },
      { new: true }
    );

    if (!updatedTeam) {
      console.log(`[PLAYER] Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log(
      `[PLAYER] Player declined team invitation successfully: ${playerId} from team: ${teamId}`
    );
    res.json({ message: "Team invitation declined successfully" });
  } catch (error) {
    console.error(`[PLAYER] Decline team invitation error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerTeam = async (req, res) => {
  try {
    const playerId = req.user._id;
    console.log(`[PLAYER] Get player team for player: ${playerId}`);

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
      console.log(`[PLAYER] No team found for player: ${playerId}`);
      return res.status(404).json({ message: "You are not part of any team" });
    }

    console.log(`[PLAYER] Player team retrieved successfully: ${team._id}`);
    res.json(team);
  } catch (error) {
    console.error(`[PLAYER] Get player team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerMatches = async (req, res) => {
  try {
    const playerId = req.user._id;
    console.log(`[PLAYER] Get player matches for player: ${playerId}`);

    const playerTeam = await Team.findOne({ players: playerId });
    if (!playerTeam) {
      console.log(`[PLAYER] No team found for player: ${playerId}`);
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

    console.log(
      `[PLAYER] Retrieved ${matches.length} matches for player: ${playerId}`
    );
    res.json(matches);
  } catch (error) {
    console.error(`[PLAYER] Get player matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerDashboard = async (req, res) => {
  try {
    const playerId = req.user._id;
    console.log(`[PLAYER] Get player dashboard for player: ${playerId}`);

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

    console.log(
      `[PLAYER] Player dashboard retrieved successfully for player: ${playerId}`
    );
    res.json(dashboardData);
  } catch (error) {
    console.error(`[PLAYER] Get player dashboard error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
