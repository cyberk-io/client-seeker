import mongoose from "mongoose";
const InvestorSchema = new mongoose.Schema(
  {
    crInvestorId: String,
    crInvestorSlug: String,
    data: JSON,
    crInvestorType: String,
    botStatus: {
      type: String,
      enum: ["new", "process", "done"],
    },
    hash: String,
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const Investor = mongoose.model("rawDataInvestorCryptorank", InvestorSchema);

const findOneInvestor = async (query) => {
  return Investor.findOne(query);
};

const createOrUpdateInvestor = async (query, record) => {
  return Investor.findOneAndUpdate(
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

export { findOneInvestor, createOrUpdateInvestor };
