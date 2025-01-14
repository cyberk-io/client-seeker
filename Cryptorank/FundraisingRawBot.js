import dotenv from "dotenv";

import { find, insertOrUpdate } from "./Models/FundraisingModel.js";
import { databaseConnect } from "./Services/MongoDBConnectService.js";
import {
  projectList,
  fundingRoundList,
} from "./services/CryptorankQueryService.js";
import { hashJson } from "./Helper.js";
import { sendNotifi } from "./Helper.js";

dotenv.config();

const isRoundExist = (projectList, key, stage, date) => {
  return projectList.data
    .find((item) => item["key"] === key)
    ["fundingRounds"].find(
      (item) => item["type"] === stage && item["date"] === date
    );
};

const createOrUpdate = async (roundID, record) => {
  await insertOrUpdate({ crRoundId: roundID }, record);
};

const fundingRoundBulkInsert = async (projectList, fundingRoundList) => {
  if (fundingRoundList.data.length == 0) return;
  const round = fundingRoundList.data.pop();
  const roundExist = isRoundExist(
    projectList,
    round["key"],
    round["stage"],
    round["date"]
  );

  if (roundExist) {
    const record_base = {
      crRoundId: roundExist["id"],
      data: JSON.stringify(round),
    };
    const hash = await hashJson(record_base);
    const { hash: hash_db } = await find({ crRoundId: roundExist["id"] });

    if (hash_db === hash) {
      console.log("Record already exists:  - " + roundExist["id"]);
      return;
    }
    try {
      await createOrUpdate(roundExist["id"], {
        ...record_base,
        hash: hash,
        botStatus: "running",
        dataLevel: "index",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastScan: new Date().toISOString(),
      });
    } catch (error) {
      sendNotifi(
        `Round ID: ${
          roundExist["id"]
        } insert error in ${new Date().toISOString()}`
      );
    }
  } else {
    console.log("No round Exist");
  }
  fundingRoundBulkInsert(projectList, fundingRoundList);
};

async function main() {
  await databaseConnect();
  const { data: projectData } = await projectList();
  const { data: fundingRoundData } = await fundingRoundList();
  await fundingRoundBulkInsert(projectData, fundingRoundData);
}
main();
