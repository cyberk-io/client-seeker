import { mongoDB } from "./database/mongoDatabase.js";

async function main() {
  await mongoDB.connect();
  const investorsInRound = await getInvestorsToProcess();
  if (!investorsInRound) {
    console.log("No investors to process");
    return;
  }

  if (investorsInRound != 0) {
    await processInvestorsBatch(investorsInRound, investorsInRound.length);
  } else {
    console.log("empty");
  }
}
main();
