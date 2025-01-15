import dotenv from "dotenv";
import cliProgress from "cli-progress";

import { find, insertOrUpdate } from "./Models/FundraisingModel.js";
import { databaseConnect } from "./Services/MongoDBConnectService.js";
import {
  projectList,
  fundingRoundList,
} from "./services/CryptorankQueryService.js";
const Helper = (await import("./Helper.js")).default;
const createFundingRoundProcess = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

dotenv.config();

/*
 * This function is used to map the funding round to the project
 * 1. Get the project data
 * 2. Get the funding round data
 * 3. Map the funding round to the project
 * 4. Return the mapped funding round
 */
const mappingFundingRound = async (projectData, fundingRoundData) => {
  return fundingRoundData.data.map((round) => {
    const matchingProject = projectData.data.find(
      (item) => item["key"] === round["key"]
    );
    const matchingRound = matchingProject?.fundingRounds.find(
      (item) =>
        item["type"] === round["stage"] && item["date"] === round["date"]
    );

    return {
      roundID: matchingRound?.id,
      ...round,
    };
  });
};
/*
 * This function is used to check if the record is duplicate
 * 1. Get hash of the record
 * 2. Get hash of the record in database
 * 3. If hash is the same, return true
 * 4. If hash is different, return false
 * 5. If record is not in database, return false
 * 6. If record is in database, return true
 * @alias isRoundRecordDuplicate
 * @param {Object} record_base - The record base
 * @param {Object} round - The round
 * @returns {boolean} - True if the record is duplicate, false otherwise
 */
const isRoundRecordDuplicate = async (record_base, round) => {
  const hash = await Helper.hashJson(record_base);
  try {
    const { hash: hash_db } = await find({ crRoundId: round["roundID"] });
    if (hash_db === hash) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

/*
 * This function is used to process the fundraising round to database
 * 1. Insert record to database
 * 2. Update record to database
 */
const createFundingRound = async (record_base, round) => {
  try {
    await insertOrUpdate(
      { crRoundId: round["roundID"] },
      {
        ...record_base,
        hash: await Helper.hashJson(record_base),
        botStatus: "running",
        dataLevel: "raw",
        lastScan: new Date().toISOString(),
      }
    );
    console.log("Record inserted: " + round["roundID"]);
  } catch (error) {
    console.log(error);
    Helper.sendNotifi(
      `Round ID: ${
        round["roundID"]
      } insert error in ${new Date().toISOString()}`
    );
  }
};
/*
 * This function is used to bulk insert the funding round to database
 * 1. If fundingRoundDataMapping is empty, return
 * 2. Get the last funding round
 * 3. Process the funding round
 * 4. Call the function again
 */

const fundingRoundBulkInsert = async (fundingRoundDataMapping) => {
  if (fundingRoundDataMapping.length == 0) {
    createFundingRoundProcess.stop();
    return;
  }
  const round = fundingRoundDataMapping.pop();
  delete round.topFollowers;
  const record_base = {
    crRoundId: round["roundID"],
    data: JSON.stringify(round),
  };
  if (!(await isRoundRecordDuplicate(record_base, round))) {
    await createFundingRound(record_base, round);
  }
  createFundingRoundProcess.update(fundingRoundDataMapping.length);
  fundingRoundBulkInsert(fundingRoundDataMapping);
};

/*
 * This function is used to run the bot
 * 1. Connect to database
 * 2. Get the project data
 * 3. Get the funding round data
 * 4. Map the funding round to the project
 * 5. Bulk insert the funding round to database
 */
async function main() {
  await databaseConnect();
  const { data: projectData } = await projectList();
  const { data: fundingRoundData } = await fundingRoundList();
  const fundingRoundDataMapping = await mappingFundingRound(
    projectData,
    fundingRoundData
  );
  // createFundingRoundProcess.start(fundingRoundDataMapping.length, 0);
  await fundingRoundBulkInsert(fundingRoundDataMapping);
}
main();
