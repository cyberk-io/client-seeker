import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { sendErrorMessageToTelegram } from "./services/telegramServices.js";
import { mongoDB } from "./database/mongoDatabase.js";
import { jsonToHash, sleep } from "./utils/helper.js";

import { findOneAndUpdateRound } from "./models/raw/RoundModel.js";

import {
  findOneInvestor,
  createOrUpdateInvestor,
} from "./models/raw/InvestorModel.js";

import {
  fetchCryptorankInvestors,
  getCryptorankInvestor,
  getCryptorankInvestorCacheId,
} from "./services/cryptorankServices.js";

const process = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

dotenv.config();

/**
 * @alias Kiểm tra Investor có cần cập nhật hay không
 * @param {object} Investor là thông tin của Investor từ Cryptorank
 * @description So sánh hash của Investor từ Cryptorank với hash của Investor trong database
 * @returns trả về true nếu Investor không cần cập nhật, false nếu Investor cần cập nhật
 */

const isInvestorRecordUpToDate = async (investor) => {
  const hash = jsonToHash(investor);
  const hash_db = await findOneInvestor({
    crInvestorSlug: investor["slug"],
  });
  return hash_db?.hash === hash;
};

/**
 * @alias Tạo hoặc cập nhật Investor trong database
 * @param {object} record là thông tin của Investor cần tạo hoặc cập nhật
 * @param {string} key là key của Investor trên Cryptorank
 * @description Tạo mới hoặc cập nhật thông tin của một Investor vào database
 * @returns không có giá trị trả về
 */
const createOrUpdateInvestorRecord = async (record, key) => {
  try {
    await createOrUpdateInvestor({ crInvestorSlug: key }, record);
  } catch (error) {
    sendErrorMessageToTelegram(
      `Round ID: ${roundId} insert error in ${new Date().toISOString()}`
    );
  }
};

/**
 * @alias Xử lý và lưu thông tin một investor
 * @param {Object} investor Thông tin investor cần lưu
 */
const processAndSaveInvestor = async (investor) => {
  try {
    const record = (await isInvestorRecordUpToDate(investor))
      ? {
          lastScan: new Date().toISOString(),
        }
      : {
          crInvestorId: investor.id,
          crInvestorSlug: investor.slug,
          data: investor,
          hash: jsonToHash(investor),
          botStatus: "new",
          updatedAt: new Date().toISOString(),
          lastScan: new Date().toISOString(),
        };
    await createOrUpdateInvestorRecord(record, investor.slug);
    console.log("Created: ", investor.slug);
  } catch (error) {
    await sendErrorMessageToTelegram(
      `Investor: ${investor.key} insert error in ${new Date().toISOString()}`
    );
  }
};

/**
 * @alias Xử lý hàng loạt investors
 * @param {Array} investors Danh sách investors cần xử lý
 * @param {number} totalLength Tổng số investors
 */
const processInvestorsBatch = async (investorsInRound, investorLength) => {
  if (investorsInRound.length === 0) {
    process.stop();
    return;
  }
  const investor = investorsInRound.pop();
  const cacheId = await getCryptorankInvestorCacheId(investor["key"]);
  const cryptorankInvestor = await getCryptorankInvestor(
    cacheId,
    investor["key"]
  );

  const cleanInvestor = {
    ...cryptorankInvestor,
  };
  delete cleanInvestor.categoriesDistribution;
  delete cleanInvestor.topInvestments;
  delete cleanInvestor.roi;

  await processAndSaveInvestor(cleanInvestor);
  await sleep(20000);
  process.update(investorLength - investorsInRound.length);
  processInvestorsBatch(investorsInRound, investorLength);
};

/**
 * @alias Lấy thông tin fundraising từ database
 * @description Lấy một fundraising có trạng thái projectScanned và cập nhật thành investorScanned
 * @returns {Object} Thông tin fundraising
 */
const getInvestorsToProcess = async () => {
  const round = await findOneAndUpdateRound(
    { dataLevel: "ProjectScanned" },
    { dataLevel: "InvestorScaned" }
  );
  return round?.data.funds;
};

async function main() {
  await mongoDB.connect();
  while (true) {
    const investorsInRound = await getInvestorsToProcess();
    if (!investorsInRound) {
      console.log("No investors to process");
      continue;
    }

    if (investorsInRound != 0) {
      await processInvestorsBatch(investorsInRound, investorsInRound.length);
    } else {
      console.log("empty");
    }
  }
}
main();
