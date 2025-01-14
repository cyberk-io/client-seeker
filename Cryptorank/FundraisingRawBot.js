import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Fundraising from "./Models/FundraisingModel.js";

dotenv.config();

const DB_COLLECTION = "raw";
const CRYPTO_RANK_URI = process.env.CRYPTO_RANK_URI;
const CRYPTO_RANK_URI_ROUNDS = process.env.CRYPTO_RANK_URI_ROUNDS;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

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
async function sendNotifi(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
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

const hashJson = async (jsonData) => {
  const jsonString = JSON.stringify(jsonData, Object.keys(jsonData).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};

const getRoundByID = async (id) => {
  return Fundraising.findOne({
    crRoundId: id,
  });
};

const isRoundExist = async (item, dataTableList) => {
  return dataTableList.data
    .find((item) => item["key"] === key)
    ["fundingRounds"].find(
      (item) => item["type"] === stage && item["date"] === date
    );
};
const createNewRound = async (roundID, record) => {
  try {
    await Fundraising.findOneAndUpdate({ crRoundId: roundID }, record, {
      upsert: true,
      new: true,
    });
    console.log("Inserting record success: - " + roundID);
    return true;
  } catch (error) {
    sendNotifi(
      `Round ID: ${roundID} insert error in ${new Date().toISOString()}`
    );
    console.log(error);
    return null;
  }
};

const fundingRoundBulkInsert = async (i, dataTableList, fundingRoungList) => {
  if (i >= fundingRoungList.data.length) return;
  const roundID = fundingRoungList.data[i]["id"];
  if (await isRoundExist(fundingRoungList.data[i], dataTableList)) {
    createNewRound(roundID);
  }
  fundingRoundBulkInsert(i + 1, dataTableList, fundingRoungList);
};

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
