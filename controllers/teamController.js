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

    const player = await User.findByUniqueID(playerUniqueId);
    if (!player) {
      console.log(
        `[TEAM] Invite player failed - Player not found with unique ID: ${playerUniqueId}`
      );
      return res.status(404).json({ message: "Player not found" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Invite player failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    const isPlayerInTeam = await Team.hasPlayer(teamId, player._id);
    if (isPlayerInTeam) {
      console.log(
        `[TEAM] Invite player failed - Player already in team: ${player._id}`
      );
      return res.status(400).json({ message: "Player already in team" });
    }

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

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[TEAM] Get team by ID request for team: ${id} by user: ${req.user._id}`
    );

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
      console.log(`[TEAM] Get team failed - Team not found: ${id}`);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log(`[TEAM] Team retrieved successfully: ${id}`);
    res.json(team);
  } catch (error) {
    console.error(`[TEAM] Get team by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaptainTeams = async (req, res) => {
  try {
    console.log(`[TEAM] Get captain teams request by captain: ${req.user._id}`);

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

    console.log(
      `[TEAM] Retrieved ${teams.length} teams for captain: ${req.user._id}`
    );
    res.json(teams);
  } catch (error) {
    console.error(`[TEAM] Get captain teams error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestPlayerRemoval = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;
    console.log(
      `[TEAM] Request player removal for team: ${teamId}, player: ${playerId} by captain: ${req.user._id}`
    );

    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Player removal failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.captainId.toString() !== req.user._id.toString()) {
      console.log(
        `[TEAM] Player removal failed - Not authorized: User ${req.user._id} is not the captain of team ${teamId}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    const isPlayerInTeam = await Team.hasPlayer(teamId, playerId);
    if (!isPlayerInTeam) {
      console.log(
        `[TEAM] Player removal failed - Player not in team: ${playerId}`
      );
      return res.status(400).json({ message: "Player not in team" });
    }

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

exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, jerseyNumbers } = req.body;
    console.log(
      `[TEAM] Update team request for team: ${teamId} by user: ${req.user._id}`
    );

    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Update team failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    if (
      team.captainId.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      console.log(
        `[TEAM] Update team failed - Not authorized: User ${req.user._id} is not the captain of team ${teamId}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, jerseyNumbers },
      { new: true }
    );

    console.log(`[TEAM] Team updated successfully: ${teamId}`);
    res.json(updatedTeam);
  } catch (error) {
    console.error(`[TEAM] Update team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    console.log(
      `[TEAM] Delete team request for team: ${teamId} by user: ${req.user._id}`
    );

    const team = await Team.findById(teamId);
    if (!team) {
      console.log(`[TEAM] Delete team failed - Team not found: ${teamId}`);
      return res.status(404).json({ message: "Team not found" });
    }

    if (
      team.captainId.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      console.log(
        `[TEAM] Delete team failed - Not authorized: User ${req.user._id} is not the captain of team ${teamId}`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    await Team.findByIdAndDelete(teamId);

    console.log(`[TEAM] Team deleted successfully: ${teamId}`);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(`[TEAM] Delete team error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
