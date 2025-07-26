const Match = require("../models/Match");
const Team = require("../models/Team");

exports.createMatch = async (req, res) => {
  try {
    const { team1Id, team2Id, matchDate, location, description } = req.body;

    const teams = await Team.find({ _id: { $in: [team1Id, team2Id] } });
    if (teams.length !== 2) {
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

    res.status(201).json({
      message: "Match created successfully",
      match: populatedMatch,
    });
  } catch (error) {
    console.error(`[MATCH] Create match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateScore = async (req, res) => {
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
    console.error(`[MATCH] Update score error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      })
      .sort({ matchDate: -1 })
      .lean();

    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    console.error(`[MATCH] Get match by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatchesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const matches = await Match.find({ status })
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      })
      .sort({ matchDate: -1 })
      .lean();

    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches by status error:`, error);
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
        select: "name captainId",
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
    console.error(`[MATCH] Update match status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, matchDate, location, description } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        status: status || match.status,
        matchDate: matchDate || match.matchDate,
        location: location || match.location,
        description: description || match.description,
      },
      { new: true }
    )
      .populate({
        path: "teams",
        select: "name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "name",
      });

    res.json({
      message: "Match updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error(`[MATCH] Update match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    await Match.findByIdAndDelete(matchId);

    res.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error(`[MATCH] Delete match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
