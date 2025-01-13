import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Fundraising from "./FundraisingSchema.js";

dotenv.config();

const DB_COLLECTION = "raw";
function hashJSON(jsonData) {
  const jsonString = JSON.stringify(jsonData, Object.keys(jsonData).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}
const CRYPTO_RANK_URI = process.env.CRYPTO_RANK_URI;
const CRYPTO_RANK_URI_ROUNDS = process.env.CRYPTO_RANK_URI_ROUNDS;

const PAYLOAD = {
  sortingColumn: "date",
  sortingDirection: "DESC",
};

const HEADERS = {
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

async function sendNotifi(message) {
  const url = `https://api.telegram.org/bot7817152536:AAE13NQsSje5TqQo6WKAqgLM0uw7VfhiqC0/sendMessage?chat_id=-4506326252&text=${message}`;
  await axios.get(url);
}

async function fundingRoundInsertOrUpdate(roundID, record) {
  try {
    await Fundraising.findOneAndUpdate({ crRoundId: roundID }, record, {
      upsert: true,
      new: true,
    });
    console.log("Inserting record success: - " + roundID);
  } catch (error) {
    sendNotifi(
      `Round ID: ${roundID} insert error in ${new Date().toISOString()}`
    );
    console.log(error);
  }
}

async function fundingRoundBulkInsert(dataTableList, fundingRoungList) {
  fundingRoungList.data.map(async (item, key) => {
    const fundingRoundData = await getFundingRoundData(
      dataTableList,
      item["key"],
      item["stage"],
      item["date"]
    );
    const record_base = {
      crRoundId: fundingRoundData["id"],
      data: JSON.stringify(item),
    };
    const hash = hashJSON(record_base);
    const { hash: hash_db } = await getFundingRoundDataByID(
      fundingRoundData["id"]
    );
    if (hash_db === hash) {
      console.log(
        "Record already exists: " + key + " - " + fundingRoundData["id"]
      );
      return;
    }
    await fundingRoundInsertOrUpdate(fundingRoundData["id"], {
      ...record_base,
      hash,
      botStatus: "running",
      dataLevel: "index",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastScan: new Date().toISOString(),
    });
  });
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI + DB_COLLECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const { data: dataTableList } = await axios.get(CRYPTO_RANK_URI);
  const { data: fundingRoungList } = await axios.post(
    CRYPTO_RANK_URI_ROUNDS,
    PAYLOAD,
    HEADERS
  );
  await fundingRoundBulkInsert(dataTableList, fundingRoungList);
}
main();
