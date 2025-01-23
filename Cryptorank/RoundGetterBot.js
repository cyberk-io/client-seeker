import dotenv from "dotenv";
import cliProgress from "cli-progress";
import { sendErrorMessageToTelegram } from "./services/telegramServices.js";
import { mongoDB } from "./database/mongoDatabase.js";
import {
  fetchCryptorankProjects,
  fetchCryptorankRounds,
} from "./services/cryptorankServices.js";
import {
  findFundraising,
  createOrUpdateFundraising,
} from "./models/raw/FundraisingModel.js";
import { jsonToHash } from "./utils/helper.js";

const process = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

dotenv.config();

/**
 * @alias Map các Rounds với các Projects
 * @description Vì các Rounds của Cryptorank không có các thông tin về RoundId nên ta cần phải map các Rounds với các Projects để lấy được các thông tin về RoundId
 * @param {Array} projects: danh sách các Projects
 * @param {Array} rounds: danh sách các Rounds
 * @returns trả về danh sách các Rounds với các RoundId tương ứng
 */
const attachRoundIds = async (projects, rounds) => {
  return rounds.map((round) => {
    const matchingProject = projects.find(
      (item) => item["key"] === round["key"]
    );
    return {
      roundID: matchingProject?.fundingRounds.find(
        (item) =>
          item["type"] === round["stage"] && item["date"] === round["date"]
      )?.id,
      ...round,
    };
  });
};
/**
 * @alias Kiểm tra xem Rounds đã tồn tại trong database chưa bằng cách kiểm tra hash của Rounds
 * @param {Object} round: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @returns trả về true nếu hash của Rounds đã tồn tại trong database và hash của Rounds trong database giống với hash của Rounds được truyền vào, trả về false nếu hash của Rounds không tồn tại trong database hoặc hash của Rounds trong database không giống với hash của Rounds được truyền vào
 */

const isRoundRecordUpToDate = async (round) => {
  const hash = jsonToHash(round);
  const hash_db = await findFundraising({
    crRoundId: round["roundID"],
  });
  return hash_db?.hash === hash;
};

/**
 * @alias Thêm Rounds vào database
 * @description Thêm Rounds vào database sử dụng hàm insertOrUpdate
 * @param {Object} round: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @returns dừng lại hàm nếu có lỗi
 */

const createOrUpdateRound = async (record, roundId) => {
  try {
    await createOrUpdateFundraising({ crRoundId: roundId }, record);
  } catch (error) {
    sendErrorMessageToTelegram(
      `Round ID: ${roundId} insert error in ${new Date().toISOString()}`
    );
  }
};

/**
 * @alias Thêm các Rounds vào database
 * @description Thêm các Rounds vào database sử dụng đệ quy. Lấy ra phần tử bằng phương thức pop(), xóa đi trường topFollowers vì không ảnh hưởng tới dữ liệu cần thiết.
 * @description Kiểm tra xem Rounds đã tồn tại trong database chưa, nếu chưa thì thêm vào database, nếu có thì bỏ qua. Hàm đệ quy sẽ dừng khi danh sách Rounds rỗng
 * @param {*} rounds: là danh sách Rounds đầy đủ dữ liệu của Cryptorank
 * @returns dừng lại đệ quy khi danh sách Rounds rỗng
 */
const roundsBulkInsert = async (rounds, length) => {
  if (rounds.length == 0) {
    process.stop();
    return;
  }
  const round = rounds.pop();
  await createOrUpdateRound(
    (await isRoundRecordUpToDate(round))
      ? {
          lastScan: new Date().toISOString(),
        }
      : {
          crRoundId: round["roundID"],
          data: round,
          hash: await jsonToHash(round),
          botStatus: "running",
          dataLevel: "raw",
          updatedAt: new Date().toISOString(),
        },
    round["roundID"]
  );
  process.update(length - rounds.length);
  roundsBulkInsert(rounds, length);
};

/**
 * @alias Hàm chính
 * @description Hàm chính được gọi để thực hiện việc thêm Rounds vào database
 * @returns dừng lại hàm nếu có lỗi
 */
async function main() {
  await mongoDB.connect();
  const { data: projects } = await fetchCryptorankProjects();
  const { data: fundingRounds } = await fetchCryptorankRounds();
  const cleanFundingRounds = fundingRounds.data.map((round) => {
    delete round.topFollowers;
    return round;
  });
  const rounds = await attachRoundIds(projects.data, cleanFundingRounds);
  process.start(rounds.length, 0);
  await roundsBulkInsert(rounds, rounds.length);
}
main();
