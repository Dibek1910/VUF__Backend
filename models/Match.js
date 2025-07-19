const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MatchScoreSchema = new Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const MatchSchema = new Schema(
  {
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    scores: [MatchScoreSchema],
    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed"],
      required: true,
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", MatchSchema);

Match.create = async (matchData) => {
  const { teams, status, matchDate, location, description } = matchData;

  const match = new Match({
    teams,
    status,
    matchDate: matchDate || new Date(),
    location: location || null,
    description: description || null,
    scores: teams.map((teamId) => ({ teamId, score: 0 })),
  });

  await match.save();

  return await Match.findById(match._id)
    .populate({
      path: "teams",
      select: "id name captainId",
    })
    .populate({
      path: "scores.teamId",
      select: "id name",
    });
};

Match.updateScore = async (matchId, teamId, score) => {
  await Match.findOneAndUpdate(
    {
      _id: matchId,
      "scores.teamId": teamId,
    },
    {
      $set: { "scores.$.score": score },
    }
  );

  return await Match.findById(matchId)
    .populate({
      path: "teams",
      select: "id name captainId",
    })
    .populate({
      path: "scores.teamId",
      select: "id name",
    });
};

Match.findAll = async () => {
  return await Match.find()
    .populate({
      path: "teams",
      select: "id name captainId",
    })
    .populate({
      path: "scores.teamId",
      select: "id name",
    })
    .sort({ matchDate: -1 });
};

Match.findById = async (id) => {
  return await Match.findOne({ _id: id })
    .populate({
      path: "teams",
      select: "id name captainId",
    })
    .populate({
      path: "scores.teamId",
      select: "id name",
    });
};

module.exports = Match;
