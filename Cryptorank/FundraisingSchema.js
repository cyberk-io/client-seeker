import mongoose from "mongoose";
const FundraisingSchema = new mongoose.Schema(
  {
    crRoundId: String,
    data: String,
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
    hash: String,
  },
  { versionKey: false }
);
const Fundraising = mongoose.model(
  "rawDataFundraisingCryptorank",
  FundraisingSchema
);
export default Fundraising;
