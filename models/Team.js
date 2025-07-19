const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    captainId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jerseyNumbers: {
      type: [Number],
    },
    removalRequested: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    invitedPlayers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", TeamSchema);

Team.findById = async (id) => {
  return await Team.findOne({ _id: id });
};

Team.create = async (teamData) => {
  const { name, captainId } = teamData;

  const team = new Team({
    name,
    captainId,
    players: [captainId],
    invitedPlayers: [],
  });

  await team.save();
  return team;
};

Team.findAll = async () => {
  return await Team.find()
    .populate({
      path: "captainId",
      select:
        "id name email phone role uniqueId subscriptionStatus subscriptionExpiryDate",
    })
    .populate({
      path: "players",
      select: "id name email phone role uniqueId",
    });
};

Team.addPlayer = async (teamId, playerId) => {
  const team = await Team.findOneAndUpdate(
    { _id: teamId },
    {
      $addToSet: { invitedPlayers: playerId },
    },
    { new: true }
  )
    .populate({
      path: "captainId",
      select:
        "id name email phone role uniqueId subscriptionStatus subscriptionExpiryDate",
    })
    .populate({
      path: "players",
      select: "id name email phone role uniqueId",
    });

  return team;
};

Team.setRemovalRequested = async (teamId, playerId) => {
  const team = await Team.findOneAndUpdate(
    { _id: teamId },
    { removalRequested: playerId },
    { new: true }
  );

  return team;
};

Team.hasPlayer = async (teamId, playerId) => {
  const team = await Team.findOne({
    _id: teamId,
    players: playerId,
  });

  return !!team;
};

module.exports = Team;
