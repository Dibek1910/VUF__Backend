const Team = require("../models/Team");
const User = require("../models/User");

exports.createTeam = async (req, res) => {
  try {
    const { name, captainId } = req.body;

    const team = await Team.create({ name, captainId });

    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.invitePlayer = async (req, res) => {
  try {
    const { teamId, playerUniqueId } = req.body;

    // Find player by unique ID
    const player = await User.findByUniqueID(playerUniqueId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if player is already in team
    const isPlayerInTeam = await Team.hasPlayer(teamId, player.id);
    if (isPlayerInTeam) {
      return res.status(400).json({ message: "Player already in team" });
    }

    // Add player to team
    const updatedTeam = await Team.addPlayer(teamId, player.id);

    res.json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();

    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestPlayerRemoval = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is captain
    if (team.captain_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if player is in team
    const isPlayerInTeam = await Team.hasPlayer(teamId, playerId);
    if (!isPlayerInTeam) {
      return res.status(400).json({ message: "Player not in team" });
    }

    // Set removal requested
    const updatedTeam = await Team.setRemovalRequested(teamId, playerId);

    res.json({ message: "Player removal requested", team: updatedTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
