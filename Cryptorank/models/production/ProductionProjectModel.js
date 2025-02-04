import mongoose from "mongoose";
const RoundSchema = new mongoose.Schema(
  {
    name: String,
    crSlug: String,
    detail: JSON,
    social: JSON,
    domain: String,
    social: String,
    website: String,
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
