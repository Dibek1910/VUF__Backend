const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MatchSchema = new Schema(
  {
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
    ],
    matchDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      default: "TBD",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Upcoming", "Live", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    scores: [
      {
        teamId: {
          type: Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    winner: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

MatchSchema.pre("save", function (next) {
  if (this.teams.length !== 2) {
    next(new Error("A match must have exactly 2 teams"));
  }

  if (this.scores.length === 0) {
    this.scores = [
      { teamId: this.teams[0], score: 0 },
      { teamId: this.teams[1], score: 0 },
    ];
  }

  next();
});

MatchSchema.pre("save", function (next) {
  if (this.status === "Completed" && this.scores.length === 2) {
    const team1Score = this.scores[0].score;
    const team2Score = this.scores[1].score;

    if (team1Score > team2Score) {
      this.winner = this.scores[0].teamId;
    } else if (team2Score > team1Score) {
      this.winner = this.scores[1].teamId;
    }
  }
  next();
});

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;
