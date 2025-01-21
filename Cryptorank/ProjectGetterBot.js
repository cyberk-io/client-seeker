import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { sendErrorMessageToTelegram } from "./services/telegramServices.js";
import { mongoDB } from "./database/mongoDatabase.js";
import { jsonToHash } from "./utils/helper.js";
import { findFundraising } from "./models/raw/FundraisingModel.js";
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

const isProjectRecordUpToDate = async (project) => {
  const hash = await jsonToHash(project);
  const hash_db = await findFundraising({
    crProjectSlug: project["key"],
  });
  return hash_db?.hash === hash;
};

const createOrUpdateProjectRecord = async (record, key) => {
  try {
    await createOrUpdateProject({ crProjectSlug: key }, record);
  } catch (error) {
    sendErrorMessageToTelegram(
      `Round ID: ${roundId} insert error in ${new Date().toISOString()}`
    );
  }
};

const projectsScanning = async () => {
  const { data: fundraising } = await findFundraising({ dataLevel: "raw" });
  const cacheId = await getCryptorankCacheId(fundraising["key"]);
  const { data: { pageProps: { coin: project } } = {} } =
    (await getCryptorankProject(cacheId, fundraising["key"])) || {};

  await createOrUpdateProjectRecord(
    (await isProjectRecordUpToDate(project))
      ? {
          lastScan: new Date().toISOString(),
        }
      : {
          crProjectSlug: project["key"],
          data: project,
          hash: await jsonToHash(project),
          dataType: "new",
          updatedAt: new Date().toISOString(),
        },
    project["key"]
  );
  //   projectsScanning(rounds, length);
};

async function main() {
  await mongoDB.connect();
  await projectsScanning();
}
main();
