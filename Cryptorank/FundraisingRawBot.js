import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_COLLECTION = "raw";
function hashJSON(jsonData) {
  const jsonString = JSON.stringify(jsonData);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}
const CRYPTO_RANK_API_URL = process.env.CRYPTO_RANK_API_URL;
const CRYPTO_RANK_API_URL_FUNDING_ROUNDS =
  process.env.CRYPTO_RANK_API_URL_FUNDING_ROUNDS;

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

const payload = {
  sortingColumn: "date",
  sortingDirection: "DESC",
};

const headers = {
  Accept: "*/*",
  "Accept-Language": "vi-VN,vi;q=0.8,en-US;q=0.5,en;q=0.3",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  Referer: "https://cryptorank.io/",
  "Content-Type": "application/json",
  "Content-Length": "84",
  Origin: "https://cryptorank.io",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  Priority: "u=4",
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  TE: "trailers",
};

async function getFundingRoundData(dataTableList, key, stage, date) {
  return dataTableList.data
    .find((item) => item["key"] === key)
    ["fundingRounds"].find(
      (item) => item["type"] === stage && item["date"] === date
    );
}

async function getFundingRoundDataByID(id) {
  return Fundraising.findOne({
    crRoundId: id,
  });
}

async function fundingRoundBulkInsert(dataTableList, fundingRoungList) {
  try {
    await Promise.all(
      fundingRoungList.data.map(async (item, key) => {
        const fundingRoundData = await getFundingRoundData(
          dataTableList,
          item["key"],
          item["stage"],
          item["date"]
        );
        const fundingRoundDataByID = await getFundingRoundDataByID(
          fundingRoundData["id"]
        );
        const record_base = {
          crRoundId: fundingRoundData["id"],
          data: JSON.stringify(item),
        };
        const hash = hashJSON(record_base);
        if (fundingRoundDataByID?.hash === hash) {
          console.log(
            "Record already exists: " + key + " - " + fundingRoundData["id"]
          );
          return;
        }
        const record = {
          ...record_base,
          hash,
          botStatus: "running",
          dataLevel: "index",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastScan: new Date().toISOString(),
        };
        await Fundraising.findOneAndUpdate(
          { crRoundId: fundingRoundData["id"] },
          record,
          {
            upsert: true,
            new: true,
          }
        );
        console.log(
          "Inserting record success: " + key + " - " + fundingRoundData["id"]
        );
      })
    );
  } catch (error) {
    console.error(error);
  } finally {
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI + DB_COLLECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const { data: dataTableList } = await axios.get(CRYPTO_RANK_API_URL);
  const { data: fundingRoungList } = await axios.post(
    CRYPTO_RANK_API_URL_FUNDING_ROUNDS,
    payload,
    headers
  );
  await fundingRoundBulkInsert(dataTableList, fundingRoungList);
  await mongoose.disconnect();
}

setInterval(() => {
  console.log("Calling API...");
  main();
}, 60 * 5000);
