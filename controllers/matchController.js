const Match = require("../models/Match");

exports.createMatch = async (req, res) => {
  try {
    const { teams, status, matchDate, location, description } = req.body;

    const match = await Match.create({
      teams,
      status,
      matchDate,
      location,
      description,
    });

    res.status(201).json(match);
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

    const updatedMatch = await Match.updateScore(matchId, teamId, score);

    res.json(updatedMatch);
  } catch (error) {
    console.error(`[MATCH] Update score error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.findAll();

    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id);
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
        select: "id name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "id name",
      })
      .sort({ matchDate: -1 });

    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches by status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const { matchId, status } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    )
      .populate({
        path: "teams",
        select: "id name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "id name",
      });

    res.json(updatedMatch);
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
        select: "id name captainId",
      })
      .populate({
        path: "scores.teamId",
        select: "id name",
      });

    res.json(updatedMatch);
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
