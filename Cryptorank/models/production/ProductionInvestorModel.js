import mongoose from "mongoose";
import mongoose from "mongoose";
const RoundSchema = new mongoose.Schema(
  {
    crRoundId: String,
    name: String,
    type: String,
    description: String,
    domain: String,
    social: String,
    text: String,
    origin: String,
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const RoundMigration = mongoose.model("Fund", RoundSchema);

const findOneRound = async (query) => {
  return RoundMigration.findOne(query);
};

export { findOneRound };
