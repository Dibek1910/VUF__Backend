const Match = require("../models/Match");

exports.createMatch = async (req, res) => {
  try {
    const { teams, status, matchDate, location, description } = req.body;
    console.log(
      `[MATCH] Create match request with status: ${status}, teams: ${teams.join(
        ", "
      )}`
    );

    const match = await Match.create({
      teams,
      status,
      matchDate,
      location,
      description,
    });

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

    const match = await Match.findById(matchId);
    if (!match) {
      console.log(`[MATCH] Update score failed - Match not found: ${matchId}`);
      return res.status(404).json({ message: "Match not found" });
    }

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

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[MATCH] Get match by ID request for match: ${id} by user: ${req.user._id}`
    );

    const match = await Match.findById(id);
    if (!match) {
      console.log(`[MATCH] Get match failed - Match not found: ${id}`);
      return res.status(404).json({ message: "Match not found" });
    }

    console.log(`[MATCH] Match retrieved successfully: ${id}`);
    res.json(match);
  } catch (error) {
    console.error(`[MATCH] Get match by ID error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMatchesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    console.log(
      `[MATCH] Get matches by status request for status: ${status} by user: ${req.user._id}`
    );

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

    console.log(
      `[MATCH] Retrieved ${matches.length} ${status} matches successfully`
    );
    res.json(matches);
  } catch (error) {
    console.error(`[MATCH] Get matches by status error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const { matchId, status } = req.body;
    console.log(
      `[MATCH] Update match status request for match: ${matchId}, status: ${status}`
    );

    const match = await Match.findById(matchId);
    if (!match) {
      console.log(
        `[MATCH] Update match status failed - Match not found: ${matchId}`
      );
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

    console.log(
      `[MATCH] Match status updated successfully for match: ${matchId} to ${status}`
    );
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
    console.log(`[MATCH] Update match request for match: ${matchId}`);

    const match = await Match.findById(matchId);
    if (!match) {
      console.log(`[MATCH] Update match failed - Match not found: ${matchId}`);
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

    console.log(`[MATCH] Match updated successfully: ${matchId}`);
    res.json(updatedMatch);
  } catch (error) {
    console.error(`[MATCH] Update match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    console.log(
      `[MATCH] Delete match request for match: ${matchId} by user: ${req.user._id}`
    );

    if (req.user.role !== "Admin") {
      console.log(
        `[MATCH] Delete match failed - Not authorized: User ${req.user._id} is not an admin`
      );
      return res.status(403).json({ message: "Not authorized" });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      console.log(`[MATCH] Delete match failed - Match not found: ${matchId}`);
      return res.status(404).json({ message: "Match not found" });
    }

    await Match.findByIdAndDelete(matchId);

    console.log(`[MATCH] Match deleted successfully: ${matchId}`);
    res.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error(`[MATCH] Delete match error:`, error);
    res.status(500).json({ message: "Server error" });
  }
};
