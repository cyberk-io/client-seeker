import mongoose from "mongoose";
const FundraisingSchema = new mongoose.Schema(
  {
    crRoundId: String,
    data: JSON,
    hash: String,
    botStatus: {
      type: String,
      enum: ["running", "error", "completed"],
    },
    dataLevel: {
      type: String,
      enum: ["index", "raw", "projectScanned", "investorScanned"],
    },
    createdAt: Date,
    updatedAt: Date,
    lastScan: Date,
  },
  { versionKey: false }
);
const Fundraising = mongoose.model(
  "rawDataFundraisingCryptorank",
  FundraisingSchema
);
const findFundraising = async (query) => {
  return await Fundraising.findOne(query);
};

const createOrUpdateFundraising = async (query, record) => {
  return await Fundraising.findOneAndUpdate(
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

export { findFundraising, createOrUpdateFundraising };
