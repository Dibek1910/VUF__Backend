const Team = require("../models/Team");
const User = require("../models/User");

exports.createTeam = async (req, res) => {
  try {
    const { name, captainId } = req.body;

    const team = await Team.create({ name, captainId });

    res.status(201).json(team);
  } catch (error) {
    console.error(`[TEAM] Create team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.invitePlayer = async (req, res) => {
  try {
    const { teamId, playerUniqueId } = req.body;

    const player = await User.findByUniqueID(playerUniqueId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isPlayerInTeam = await Team.hasPlayer(teamId, player._id);
    if (isPlayerInTeam) {
      return res.status(400).json({ message: "Player already in team" });
    }

    const updatedTeam = await Team.addPlayer(teamId, player._id);

    res.json(updatedTeam);
  } catch (error) {
    console.error(`[TEAM] Invite player error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();

    res.json(teams);
  } catch (error) {
    console.error(`[TEAM] Get teams error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate({
        path: "captainId",
        select:
          "id name email phone role uniqueId subscriptionStatus subscriptionExpiryDate",
      })
      .populate({
        path: "players",
        select: "id name email phone role uniqueId",
      });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error(`[TEAM] Get team by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaptainTeams = async (req, res) => {
  try {
    const teams = await Team.find({ captainId: req.user._id })
      .populate({
        path: "captainId",
        select:
          "id name email phone role uniqueId subscriptionStatus subscriptionExpiryDate",
      })
      .populate({
        path: "players",
        select: "id name email phone role uniqueId",
      });

    res.json(teams);
  } catch (error) {
    console.error(`[TEAM] Get captain teams error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestPlayerRemoval = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.captainId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isPlayerInTeam = await Team.hasPlayer(teamId, playerId);
    if (!isPlayerInTeam) {
      return res.status(400).json({ message: "Player not in team" });
    }

    const updatedTeam = await Team.setRemovalRequested(teamId, playerId);

    res.json({ message: "Player removal requested", team: updatedTeam });
  } catch (error) {
    console.error(`[TEAM] Player removal error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, jerseyNumbers } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (
      team.captainId.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, jerseyNumbers },
      { new: true }
    );

    res.json(updatedTeam);
  } catch (error) {
    console.error(`[TEAM] Update team error:`, error);
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

    if (
      team.captainId.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(`[TEAM] Delete team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
