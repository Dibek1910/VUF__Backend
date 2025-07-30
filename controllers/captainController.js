const Team = require("../models/Team");
const User = require("../models/User");
const Match = require("../models/Match");

exports.getCaptainDashboard = async (req, res) => {
  try {
    const captainId = req.user._id;

    const captain = await User.findById(captainId);
    if (!captain.isApproved) {
      return res.status(403).json({
        message: "Captain approval pending. Please wait for admin approval.",
      });
    }

    const [captainTeams, totalMatches, recentMatches] = await Promise.all([
      Team.find({ captainId }).populate({
        path: "players",
        select: "name email uniqueId",
      }),
      Match.countDocuments({
        teams: { $in: await Team.find({ captainId }).distinct("_id") },
      }),
      Match.find({
        teams: { $in: await Team.find({ captainId }).distinct("_id") },
      })
        .populate({
          path: "teams",
          select: "name",
        })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const dashboardData = {
      captain: {
        name: captain.name,
        email: captain.email,
        uniqueId: captain.uniqueId,
        isApproved: captain.isApproved,
      },
      statistics: {
        totalTeams: captainTeams.length,
        totalPlayers: captainTeams.reduce(
          (sum, team) => sum + team.players.length,
          0
        ),
        totalMatches,
        pendingInvitations: captainTeams.reduce(
          (sum, team) => sum + (team.invitedPlayers?.length || 0),
          0
        ),
      },
      teams: captainTeams,
      recentMatches,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(`[CAPTAIN] Get captain dashboard error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const captainId = req.user._id;

    const captain = await User.findById(captainId);
    if (!captain.isApproved) {
      return res.status(403).json({
        message:
          "Captain approval pending. Cannot create team until approved by admin.",
      });
    }

    const existingTeam = await Team.findOne({ captainId });
    if (existingTeam) {
      return res.status(400).json({
        message:
          "You already have a team. Each captain can only create one team.",
      });
    }

    const team = await Team.create({
      name,
      captainId,
      players: [captainId],
      invitedPlayers: [],
      jerseyNumbers: { [captainId]: 1 },
    });

    const populatedTeam = await Team.findById(team._id)
      .populate({
        path: "captainId",
        select: "name email phone uniqueId isApproved",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      });

    res.status(201).json({
      message: "Team created successfully",
      team: populatedTeam,
    });
  } catch (error) {
    console.error(`[CAPTAIN] Create team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.invitePlayer = async (req, res) => {
  try {
    const { teamId, playerUniqueId } = req.body;
    const captainId = req.user._id;

    const team = await Team.findOne({ _id: teamId, captainId });
    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or not authorized" });
    }

    const player = await User.findOne({
      uniqueId: playerUniqueId,
      role: "Player",
    });
    if (!player) {
      return res
        .status(404)
        .json({ message: "Player not found with this unique ID" });
    }

    const existingTeamMembership = await Team.findOne({ players: player._id });
    if (existingTeamMembership) {
      return res.status(400).json({
        message: "Player is already part of another team",
      });
    }

    if (team.invitedPlayers && team.invitedPlayers.includes(player._id)) {
      return res.status(400).json({
        message: "Player has already been invited to this team",
      });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { invitedPlayers: player._id } },
      { new: true }
    )
      .populate({
        path: "captainId",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "players",
        select: "name email phone uniqueId",
      })
      .populate({
        path: "invitedPlayers",
        select: "name email phone uniqueId",
      });

    res.json({
      message: "Player invitation sent successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[CAPTAIN] Invite player error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignJerseyNumber = async (req, res) => {
  try {
    const { teamId, playerId, jerseyNumber } = req.body;
    const captainId = req.user._id;

    const team = await Team.findOne({ _id: teamId, captainId });
    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or not authorized" });
    }

    if (!team.players.includes(playerId)) {
      return res.status(400).json({ message: "Player is not in this team" });
    }

    const jerseyNumbers = team.jerseyNumbers || {};
    const existingPlayer = Object.keys(jerseyNumbers).find(
      (pid) =>
        jerseyNumbers[pid] === jerseyNumber && pid !== playerId.toString()
    );

    if (existingPlayer) {
      return res.status(400).json({
        message: `Jersey number ${jerseyNumber} is already assigned to another player`,
      });
    }

    jerseyNumbers[playerId] = jerseyNumber;

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { jerseyNumbers },
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
      message: "Jersey number assigned successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[CAPTAIN] Assign jersey number error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaptainMatches = async (req, res) => {
  try {
    const captainId = req.user._id;

    const captainTeams = await Team.find({ captainId });
    const teamIds = captainTeams.map((team) => team._id);

    if (teamIds.length === 0) {
      return res.json([]);
    }

    const matches = await Match.find({ teams: { $in: teamIds } })
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
    console.error(`[CAPTAIN] Get captain matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const captainId = req.user._id;

    const team = await Team.findOne({ _id: teamId, captainId });
    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or not authorized" });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        name: name || team.name,
        description: description || team.description,
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
      message: "Team details updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(`[CAPTAIN] Update team details error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
