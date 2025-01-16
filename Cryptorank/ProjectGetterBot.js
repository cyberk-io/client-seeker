import dotenv from "dotenv";
import { databaseConnect } from "./Services/MongoDBConnectService.js";

dotenv.config();

async function main() {
  await databaseConnect();
  //   const { data: projectData } = await projectList();
  //   const { data: fundingRoundData } = await fundingRoundList();
  //   const fundingRoundDataMapping = await mappingFundingRound(
  //     projectData,
  //     fundingRoundData
  //   );
  //   // createFundingRoundProcess.start(fundingRoundDataMapping.length, 0);
  //   await fundingRoundBulkInsert(fundingRoundDataMapping);
}
main();
