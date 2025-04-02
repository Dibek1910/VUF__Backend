const Match = require("../models/Match");

exports.createMatch = async (req, res) => {
  try {
    const { teams, status } = req.body;

    const match = await Match.create({ teams, status });

    res.status(201).json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { matchId, teamId, score } = req.body;

    // Find match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Update score
    const updatedMatch = await Match.updateScore(matchId, teamId, score);

    res.json(updatedMatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.findAll();

    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
