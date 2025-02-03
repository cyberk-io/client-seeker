import mongoose from "mongoose";
const RoundSchema = new mongoose.Schema(
  {
    crRoundId: String,
    data: JSON,
    hash: String,
    botStatus: {
      type: String,
      enum: ["new", "process", "done"],
    },
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const Round = mongoose.model("rawDataRoundCryptorank", RoundSchema);

const findOneRound = async (query) => {
  return Round.findOne(query);
};

const findOneAndUpdateRound = async (filter, update) => {
  return Round.findOneAndUpdate(filter, update, {
    sort: { createdAt: -1 },
    new: true,
  });
};

const createOrUpdateRound = async (query, record) => {
  return Round.findOneAndUpdate(
    query,
    {
      ...record,
      createdAt: new Date().toISOString(),
    },
    {
      upsert: true,
      new: true,
    }
  );
};

export { findOneRound, findOneAndUpdateRound, createOrUpdateRound };
