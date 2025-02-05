import mongoose from "mongoose";
import { InvestorMigration } from "./ProductionInvestorModel.js";
import { ProjectMigration } from "./ProductionProjectModel.js";

const RoundSchema = new mongoose.Schema(
  {
    crRoundId: String,
    amount: String,
    raised: String,
    date: Date,
    round: String,
    hash: String,
    status: {
      type: String,
      enum: ["wait", "emplyeeScaning", "ready", "notified"],
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    investor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Investor" }],
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const RoundMigration = mongoose.model("Fund", RoundSchema);

const findOneRound = async (query) => {
  return RoundMigration.findOne(query)
    .populate({
      path: "investor",
      model: InvestorMigration,
    })
    .populate({
      path: "project",
      model: ProjectMigration,
    });
};

const createOrUpdateRound = async (query, record) => {
  return RoundMigration.findOneAndUpdate(
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

export { findOneRound, createOrUpdateRound };
