import dotenv from "dotenv";
import cliProgress from "cli-progress";

const database = (await import("../config/database.js")).default;
const fundraising = (await import("../models/raw/FundraisingModel.js")).default;
const cryptoRankService = (await import("../services/cryptorank.js")).default;
const helper = (await import("../utils/helper.js")).default;
const process = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

dotenv.config();

/**
 * @alias Map các Rounds với các Projects
 * @description Vì các Rounds của Cryptorank không có các thông tin về RoundId nên ta cần phải map các Rounds với các Projects để lấy được các thông tin về RoundId
 * @param {Array} projectData: danh sách các Projects
 * @param {Array} rounds: danh sách các Rounds
 * @returns trả về danh sách các Rounds với các RoundId tương ứng
 */
const mappingFundingRound = async (projectData, rounds) => {
  return rounds.map((round) => {
    const matchingProject = projectData.find(
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
/**
 * @alias Kiểm tra xem Rounds đã tồn tại trong database chưa bằng cách kiểm tra hash của Rounds
 * @param {Object} record_base: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @param {Object} round: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @returns trả về true nếu hash của Rounds đã tồn tại trong database và hash của Rounds trong database giống với hash của Rounds được truyền vào, trả về false nếu hash của Rounds không tồn tại trong database hoặc hash của Rounds trong database không giống với hash của Rounds được truyền vào
 */

const isRoundRecordUptodate = async (record_base, round) => {
  const hash = await helper.jsonToHash(record_base);
  const hash_db = await fundraising.find({
    crRoundId: round["roundID"],
  });
  return hash_db?.hash === hash;
};

/**
 * @alias Thêm Rounds vào database
 * @description Thêm Rounds vào database sử dụng hàm insertOrUpdate
 * @param {Object} record_base: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @param {Object} round: là đối tượng Rounds đầy đủ dữ liệu của Cryptorank
 * @returns dừng lại hàm nếu có lỗi
 */

const createOrUpdateRound = async (record, roundId) => {
  try {
    await fundraising.insertOrUpdate({ crRoundId: roundId }, record);
    // console.log("Record Updated: " + roundId);
  } catch (error) {
    console.log(error);
    helper.sendNotifi(
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
const roundsBulkInsert = async (rounds) => {
  if (rounds.length == 0) {
    process.stop();
    return;
  }
  const round = rounds.pop();
  delete round.topFollowers;
  const record_base = {
    data: round,
  };
  (await isRoundRecordUptodate(record_base, round))
    ? await createOrUpdateRound(
        {
          lastScan: new Date().toISOString(),
        },
        round["roundID"]
      )
    : await createOrUpdateRound(
        {
          ...record_base,
          hash: await helper.jsonToHash(record_base),
          botStatus: "running",
          dataLevel: "raw",
          updatedAt: new Date().toISOString(),
        },
        round["roundID"]
      );
  process.update(rounds.length);
  roundsBulkInsert(rounds);
};

/**
 * @alias Hàm chính
 * @description Hàm chính được gọi để thực hiện việc thêm Rounds vào database
 * @returns dừng lại hàm nếu có lỗi
 */
async function main() {
  await database.mongoDB.connect();
  const { data: projects } = await cryptoRankService.fetchProjects();
  const { data: fundingRounds } = await cryptoRankService.fetchRounds();
  const rounds = await mappingFundingRound(projects.data, fundingRounds.data);
  process.start(rounds.length, 0);
  await roundsBulkInsert(rounds);
}
main();
