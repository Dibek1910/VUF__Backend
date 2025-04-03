const Team = require("../models/Team");
const User = require("../models/User");

exports.createTeam = async (req, res) => {
  try {
    const { name, captainId } = req.body;
    console.log(
      `[TEAM] Create team request with name: ${name}, captain: ${captainId}`
    );

    const team = await Team.create({ name, captainId });

    console.log(
      `[TEAM] Team created successfully: ${team._id}, name: ${team.name}`
    );
    res.status(201).json(team);
  } catch (error) {
    console.error(`[TEAM] Create team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.invitePlayer = async (req, res) => {
  try {
    const { teamId, playerUniqueId } = req.body;
    console.log(
      `[TEAM] Invite player request for team: ${teamId}, player unique ID: ${playerUniqueId}`
    );

    // Find player by unique ID
    const player = await User.findByUniqueID(playerUniqueId);
    if (!player) {
      console.log(
        `[TEAM] Invite player failed - Player not found with unique ID: ${playerUniqueId}`
      );
      return res.status(404).json({ message: "Player not found" });
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Invite player failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if player is already in team
    const isPlayerInTeam = await Team.hasPlayer(teamId, player._id);
    if (isPlayerInTeam) {
      console.log(
        `[TEAM] Invite player failed - Player already in team: ${player._id}`
      );
      return res.status(400).json({ message: "Player already in team" });
    }

    // Add player to team
    const updatedTeam = await Team.addPlayer(teamId, player._id);

    console.log(
      `[TEAM] Player invited successfully: ${player._id} to team: ${teamId}`
    );
    res.json(updatedTeam);
  } catch (error) {
    console.error(`[TEAM] Invite player error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeams = async (req, res) => {
  try {
    console.log(`[TEAM] Get all teams request by user: ${req.user._id}`);

    const teams = await Team.findAll();

    console.log(`[TEAM] Retrieved ${teams.length} teams successfully`);
    res.json(teams);
  } catch (error) {
    console.error(`[TEAM] Get teams error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestPlayerRemoval = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;
    console.log(
      `[TEAM] Request player removal for team: ${teamId}, player: ${playerId} by captain: ${req.user._id}`
    );

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Player removal failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is captain
    if (team.captainId.toString() !== req.user._id.toString()) {
      console.log(
        `[TEAM] Player removal failed - Not authorized: User ${req.user._id} is not the captain of team ${teamId}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if player is in team
    const isPlayerInTeam = await Team.hasPlayer(teamId, playerId);
    if (!isPlayerInTeam) {
      console.log(
        `[TEAM] Player removal failed - Player not in team: ${playerId}`
      );
      return res.status(400).json({ message: "Player not in team" });
    }

    // Set removal requested
    const updatedTeam = await Team.setRemovalRequested(teamId, playerId);

    console.log(
      `[TEAM] Player removal requested successfully for player: ${playerId} from team: ${teamId}`
    );
    res.json({ message: "Player removal requested", team: updatedTeam });
  } catch (error) {
    console.error(`[TEAM] Player removal error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
