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
    description: {
      type: String,
      default: "",
    },
    jerseyNumbers: {
      type: Map,
      of: Number,
      default: new Map(),
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

TeamSchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

TeamSchema.statics.create = async function (teamData) {
  const { name, captainId, description } = teamData;

  const team = new this({
    name,
    captainId,
    description: description || "",
    players: [captainId],
    invitedPlayers: [],
    jerseyNumbers: new Map([[captainId.toString(), 1]]),
  });

  await team.save();
  return team;
};

TeamSchema.statics.findAll = async function () {
  return await this.find()
    .populate({
      path: "captainId",
      select: "name email phone uniqueId isApproved",
    })
    .populate({
      path: "players",
      select: "name email phone uniqueId",
    })
    .populate({
      path: "removalRequested",
      select: "name email phone uniqueId",
    });
};

TeamSchema.statics.addPlayer = async function (teamId, playerId) {
  const team = await this.findOneAndUpdate(
    { _id: teamId },
    {
      $addToSet: { invitedPlayers: playerId },
    },
    { new: true }
  )
    .populate({
      path: "captainId",
      select: "name email phone uniqueId isApproved",
    })
    .populate({
      path: "players",
      select: "name email phone uniqueId",
    });

  return team;
};

TeamSchema.statics.setRemovalRequested = async function (teamId, playerId) {
  const team = await this.findOneAndUpdate(
    { _id: teamId },
    { removalRequested: playerId },
    { new: true }
  );

  return team;
};

TeamSchema.statics.hasPlayer = async function (teamId, playerId) {
  const team = await this.findOne({
    _id: teamId,
    players: playerId,
  });

  return !!team;
};

TeamSchema.methods.getJerseyNumber = function (playerId) {
  return this.jerseyNumbers.get(playerId.toString());
};

TeamSchema.methods.setJerseyNumber = function (playerId, jerseyNumber) {
  this.jerseyNumbers.set(playerId.toString(), jerseyNumber);
  return this.save();
};

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
