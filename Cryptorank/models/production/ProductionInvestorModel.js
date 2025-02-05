import mongoose from "mongoose";
const InvestorSchema = new mongoose.Schema(
  {
    crInvestorId: String,
    name: String,
    slug: String,
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
const InvestorMigration = mongoose.model("Investor", InvestorSchema);

const findOneInvestor = async (query) => {
  return InvestorMigration.findOne(query);
};

const createOrUpdateInvestor = async (query, record) => {
  return InvestorMigration.findOneAndUpdate(
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
export { findOneInvestor, createOrUpdateInvestor, InvestorMigration };
