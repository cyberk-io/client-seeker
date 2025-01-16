import dotenv from "dotenv";
dotenv.config();

const request = (await import("../config/request.js")).default;

const CRYPTO_RANK_URI = process.env.CRYPTO_RANK_URI;
const CRYPTO_RANK_URI_ROUNDS = process.env.CRYPTO_RANK_URI_ROUNDS;

const ROUND_PAYLOAD = {
  sortingColumn: "date",
  sortingDirection: "DESC",
};

const HEADERS = {
  Accept: "*/*",
  "Accept-Language": "vi-VN,vi;q=0.8,en-US;q=0.5,en;q=0.3",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  Referer: "https://cryptorank.io/",
  "Content-Type": "application/json",
  "Content-Length": "84",
  Origin: "https://cryptorank.io",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  Priority: "u=4",
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  TE: "trailers",
};

/**
 * @alias Lấy tất cả Projects của Cryptorank
 * @description Lấy tất cả Projects của Cryptorank từ API của Cryptorank
 * @returns trả về danh sách tất cả Projects của Cryptorank
 */
const fetchProjects = async () => {
  return await request.axiosModule.get(CRYPTO_RANK_URI);
};

/**
 * @alias Lấy tất cả Rounds của Cryptorank
 * @description Lấy tất cả Rounds của Cryptorank từ API của Cryptorank
 * @returns trả về danh sách tất cả Rounds của Cryptorank
 */
const fetchRounds = async () => {
  return await request.axiosModule.post(
    CRYPTO_RANK_URI_ROUNDS,
    HEADERS,
    ROUND_PAYLOAD
  );
};
export default {
  fetchProjects,
  fetchRounds,
};
