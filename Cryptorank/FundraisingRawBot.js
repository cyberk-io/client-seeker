const axios = require("axios");
const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");

function hashJSON(jsonData) {
  const jsonString = JSON.stringify(jsonData); // Chuyển JSON thành chuỗi
  return crypto.createHash("sha256").update(jsonString).digest("hex"); // Tính băm SHA-256
}

const uri = "mongodb+srv://rhass:rhass@cluster0.vq7bx.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
});

const urlAllDB =
  "https://api.cryptorank.io/v0/coins?withFundingRoundsData=true&lifeCycle=crowdsale,inactive,funding,scheduled,traded&locale=en&date=asc";

const urlFundingRound = "https://api.cryptorank.io/v0/funding-rounds-v2";

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

let dataTableList = [];

async function fetchAllDB() {
  const response = await axios.get(urlAllDB);
  dataTableList = response.data;
}

async function findFundingRound(key, stage, date) {
  const project = dataTableList.data.find((item) => item["key"] === key);
  const fundingRound = project["fundingRounds"].find(
    (item) => item["type"] === stage && item["date"] === date
  );
  return fundingRound;
}

async function insertOrUpdateOne(database, query, record) {
  try {
    const collection = database.collection("rawDataFundraisingCryptorank");
    const options = { upsert: true };
    const result = await collection.updateOne(query, record, options);
    if (result.upsertedCount > 0) {
      console.log(`Document inserted with _id: ${result.upsertedId._id}`);
    } else {
      console.log(`Document updated: ${result.modifiedCount} modified`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
  }
}

async function fetchFundingRound(database) {
  try {
    const response = await axios.post(urlFundingRound, payload, headers);
    const Fundraising = response.data;
    var id_list = [];
    await Promise.all(
      Fundraising.data.map(async (item, key) => {
        const fundingRound = await findFundingRound(
          item["key"],
          item["stage"],
          item["date"]
        );
        const record_base = {
          crRoundId: fundingRound["id"],
          data: JSON.stringify(item),
          botStatus: "running",
          dataLevel: "Index",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastScan: new Date().toISOString(),
        };
        const record = {
          ...record_base,
          hash: hashJSON(record_base),
        };
        await insertOrUpdateOne(
          database,
          { crRoundId: fundingRound["id"] },
          { $set: record }
        );
        console.log(
          "Inserting record success: " + key + " - " + fundingRound["id"]
        );
      })
    );
  } catch (error) {
    console.error(error);
  } finally {
  }
}

async function main() {
  console.log("Connecting to database");
  await client.connect();
  const database = client.db("raw");
  console.log("Connecting to database success");
  console.log("Fetching data table list");
  await fetchAllDB();
  console.log("Fetching data table list success");
  console.log("Fetching funding round");
  await fetchFundingRound(database);
  console.log("Fetching funding round success");
  await client.close();
}

setInterval(() => {
  console.log("Calling API...");
  main();
}, 60 * 5000);
