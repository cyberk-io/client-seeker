import mongoose from "mongoose";
const RoundSchema = new mongoose.Schema(
  {
    crRoundId: String,
    amount: String,
    raised: Date,
    round: String,
    status: {
      type: String,
      enum: ["wait", "emplyeeScaning", "ready", "notified"],
    },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    investor: { type: Schema.Types.ObjectId, ref: "Investor" },
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
