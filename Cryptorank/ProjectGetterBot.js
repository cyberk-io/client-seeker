import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { sendErrorMessageToTelegram } from "./services/telegramServices.js";
import { mongoDB } from "./database/mongoDatabase.js";
import { jsonToHash, sleep } from "./utils/helper.js";
import {
  findFundraising,
  findAndUpdateRound,
} from "./models/raw/FundraisingModel.js";
import {
  getCryptorankCacheId,
  getCryptorankProject,
} from "./services/cryptorankServices.js";
import { createOrUpdateProject } from "./models/raw/ProjectModel.js";

const process = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

dotenv.config();

/**
 * @alias Kiểm tra Project có cần cập nhật hay không
 * @param {object} project là thông tin của Project từ Cryptorank
 * @description So sánh hash của Project từ Cryptorank với hash của Project trong database
 * @returns trả về true nếu Project không cần cập nhật, false nếu Project cần cập nhật
 */

const isProjectRecordUpToDate = async (project) => {
  const hash = jsonToHash(project);
  const hash_db = await findFundraising({
    crProjectSlug: project["key"],
  });
  return hash_db?.hash === hash;
};

/**
 * @alias Tạo hoặc cập nhật Project trong database
 * @param {object} record là thông tin của Project cần tạo hoặc cập nhật
 * @param {string} key là key của Project trên Cryptorank
 * @description Tạo mới hoặc cập nhật thông tin của một Project vào database
 * @returns không có giá trị trả về
 */
const createOrUpdateProjectRecord = async (record, key) => {
  try {
    await createOrUpdateProject({ crProjectSlug: key }, record);
  } catch (error) {
    sendErrorMessageToTelegram(
      `Round ID: ${roundId} insert error in ${new Date().toISOString()}`
    );
  }
};

/**
 * @alias Quét thông tin Project từ Cryptorank
 * @description Lấy thông tin chi tiết của Project từ Cryptorank và lưu vào database
 * @returns không có giá trị trả về
 */

const projectCreate = async () => {
  const { data: fundraising } = await findAndUpdateRound(
    { dataLevel: "raw" },
    { dataLevel: "projectScanned" }
  );
  const cacheId = await getCryptorankCacheId(fundraising["key"]);
  const project = await getCryptorankProject(cacheId, fundraising["key"]);
  await createOrUpdateProjectRecord(
    (await isProjectRecordUpToDate(project))
      ? {
          lastScan: new Date().toISOString(),
        }
      : {
          crProjectSlug: project["key"],
          data: project,
          hash: jsonToHash(project),
          dataType: "new",
          updatedAt: new Date().toISOString(),
        },
    project["key"]
  );
  console.log("Created: ", project["key"]);
  await sleep(10000);
  projectCreate();
};

async function main() {
  await mongoDB.connect();
  await projectCreate();
}
main();
