import { mongoDB } from "./database/mongoDatabase.js";
import { findOneAndUpdateRound } from "./models/raw/RoundModel.js";
import {
  createOrUpdateRound,
  findOneRound,
} from "./models/production/ProductionRoundModel.js";
import { jsonToHash } from "./utils/helper.js";
import { createOrUpdateInvestor } from "./models/production/ProductionInvestorModel.js";
import { createOrUpdateProject } from "./models/production/ProductionProjectModel.js";

const getRoundToProcess = async () => {
  return await findOneAndUpdateRound(
    { dataLevel: "InvestorScaned" },
    { dataLevel: "ProcessedRaw" }
  );
};

const isRoundRecordUpToDate = async (round) => {
  const hash = jsonToHash(round);
  const hash_db = await findOneRound({
    crRoundId: round["crRoundId"],
  });
  return hash_db?.hash === hash;
};

const saveRound = async (record, roundId) => {
  try {
    await createOrUpdateRound({ crRoundId: roundId }, record);
  } catch (error) {
    console.log(error);
    sendErrorMessageToTelegram(
      `Round ID: ${roundId} insert error in ${new Date().toISOString()}`
    );
  }
};
const processAndSaveProject = async (round) => {
  const projectRecord = await createOrUpdateProject(
    { crSlug: round.data.key },
    {
      name: round.data.name,
      crSlug: round.data.key,
    }
  );
  return projectRecord;
};
const processAndSaveInvestors = async (investors) => {
  const investorIds = [];
  for (const investorData of investors) {
    const investorRecord = await createOrUpdateInvestor(
      { slug: investorData.key },
      {
        name: investorData.name,
        slug: investorData.key,
      }
    );
    investorIds.push(investorRecord._id);
  }
  return investorIds;
};
/**
 * @alias Xử lý và lưu thông tin một round
 * @param {Object} round Thông tin round cần lưu

 */
const processAndSaveRound = async (round) => {
  const projectRecord = await processAndSaveProject(round);
  const roundInvestorRecord = await processAndSaveInvestors(round.data.funds);
  try {
    const roundData = {
      crRoundId: round.data.roundID,
      amount: 0,
      raised: round.data.raise,
      date: round.data.date,
      round: round.data.stage,
      status: "wait",
      project: projectRecord._id,
      investor: roundInvestorRecord,
    };
    await saveRound(
      (await isRoundRecordUpToDate(roundData))
        ? {
            lastScan: new Date().toISOString(),
          }
        : {
            ...roundData,
            hash: jsonToHash(roundData),
            updatedAt: new Date().toISOString(),
            lastScan: new Date().toISOString(),
          },
      round["crRoundId"]
    );
  } catch (error) {
    console.log(error);
    await sendErrorMessageToTelegram(
      `Investor: ${investor.key} insert error in ${new Date().toISOString()}`
    );
  }
};

async function main() {
  await mongoDB.connect();
  // while (true) {
  const roundProcessing = await getRoundToProcess();
  if (!roundProcessing) {
    console.log("No round to process");
    return;
  }
  console.log(roundProcessing);
  if (roundProcessing != 0) {
    await processAndSaveRound(roundProcessing);
  } else {
    console.log("empty");
  }
  // }
}
main();
