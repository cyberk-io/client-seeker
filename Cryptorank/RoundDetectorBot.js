import { mongoDB } from "./database/mongoDatabase.js";
import { findOneRound } from "./models/production/ProductionRoundModel.js";
import { sendNewRoundToTelegram } from "./services/telegramServices.js";

const getRoundToProcess = async () => {
  return await findOneRound({ status: "wait" }, { status: "wait" });
};

async function main() {
  await mongoDB.connect();
  // while (true) {
  const roundProcessing = await getRoundToProcess();
  if (!roundProcessing) {
    console.log("No round to process");
    return;
  }
  let messageStruture = `
    - Project: ${roundProcessing.project.name}
    - Round name: ${roundProcessing.round}
    - Raised: $${roundProcessing.raised}
    - Date raised: ${roundProcessing.date}
    - Investor: ${roundProcessing.investor
      .map((value) => {
        return value.name;
      })
      .join(", ")}
  `;
  console.log(messageStruture);
  sendNewRoundToTelegram(messageStruture);
  // }
}
main();
