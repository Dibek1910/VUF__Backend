const Match = require("../models/Match");

exports.createMatch = async (req, res) => {
  try {
    const { teams, status } = req.body;
    console.log(
      `[MATCH] Create match request with status: ${status}, teams: ${teams.join(
        ", "
      )}`
    );

    const match = await Match.create({ teams, status });

    console.log(`[MATCH] Match created successfully: ${match._id}`);
    res.status(201).json(match);
  } catch (error) {
    console.error(`[MATCH] Create match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { matchId, teamId, score } = req.body;
    console.log(
      `[MATCH] Update score request for match: ${matchId}, team: ${teamId}, score: ${score}`
    );

    // Find match
    const match = await Match.findById(matchId);
    if (!match) {
      console.log(`[MATCH] Update score failed - Match not found: ${matchId}`);
      return res.status(404).json({ message: "Match not found" });
    }

    // Update score
    const updatedMatch = await Match.updateScore(matchId, teamId, score);

    console.log(
      `[MATCH] Score updated successfully for match: ${matchId}, team: ${teamId}`
    );
    res.json(updatedMatch);
  } catch (error) {
    console.error(`[MATCH] Update score error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatches = async (req, res) => {
  try {
    console.log(`[MATCH] Get all matches request by user: ${req.user._id}`);

    const matches = await Match.findAll();

    console.log(`[MATCH] Retrieved ${matches.length} matches successfully`);
    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
