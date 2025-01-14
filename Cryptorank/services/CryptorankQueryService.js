import { axiosGet, axiosPost } from "../middleware/AxiosConnector.js";
import dotenv from "dotenv";

dotenv.config();

const CRYPTO_RANK_URI = process.env.CRYPTO_RANK_URI;
const CRYPTO_RANK_URI_ROUNDS = process.env.CRYPTO_RANK_URI_ROUNDS;

const ROUND_PAYLOAD = {
  sortingColumn: "date",
  sortingDirection: "DESC",
  limit: 2,
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

export const projectList = async () => {
  return await axiosGet(CRYPTO_RANK_URI);
};
export const fundingRoundList = async () => {
  return await axiosPost(CRYPTO_RANK_URI_ROUNDS, HEADERS, ROUND_PAYLOAD);
};
