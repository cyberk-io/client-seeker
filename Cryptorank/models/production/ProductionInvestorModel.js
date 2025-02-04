import mongoose from "mongoose";
const RoundSchema = new mongoose.Schema(
  {
    crRoundId: String,
    name: String,
    type: String,
    description: String,
    domain: String,
    social: JSON,
    text: String,
    origin: String,
    status: {
      type: String,
      enum: ["scanning", "done", "error", "trained"],
    },
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const RoundMigration = mongoose.model("Investor", RoundSchema);

const findOneRound = async (query) => {
  return RoundMigration.findOne(query);
};

export { findOneRound };
