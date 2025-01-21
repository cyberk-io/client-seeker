import { axiosServices } from "./axiosServices.js";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";

dotenv.config();

const CRYPTO_RANK_URI = process.env.CRYPTO_RANK_URI;
const CRYPTO_RANK_URI_ROUNDS = process.env.CRYPTO_RANK_URI_ROUNDS;
const CRYPTO_RANK_CACHE_URI = process.env.CRYPTO_RANK_CACHE_URI;
const CRYPTO_RANK_PROJECT_URI = process.env.CRYPTO_RANK_PROJECT_URI;

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
const fetchCryptorankProjects = async () => {
  return await axiosServices.get(CRYPTO_RANK_URI);
};

/**
 * @alias Lấy tất cả Rounds của Cryptorank
 * @description Lấy tất cả Rounds của Cryptorank từ API của Cryptorank
 * @returns trả về danh sách tất cả Rounds của Cryptorank
 */
const fetchCryptorankRounds = async () => {
  return await axiosServices.post(
    CRYPTO_RANK_URI_ROUNDS,
    HEADERS,
    ROUND_PAYLOAD
  );
};

/**
 * @alias Lấy buildId của Cryptorank
 * @param {string} key là key của project trên Cryptorank
 * @description buildId là chỉ số thời gian của file cache trên hệ thống cryptorank
 * @returns trả về buildId của Cryptorank để sử dụng cho các API khác
 */
const getCryptorankCacheId = async (key) => {
  const response = await axiosServices.get(`${CRYPTO_RANK_CACHE_URI}${key}`);
  const document = new JSDOM(response.data).window.document;
  const jsonData = JSON.parse(
    document.querySelector("script#__NEXT_DATA__").textContent
  );
  return jsonData.buildId;
};

/**
 * @alias Lấy thông tin Project của Cryptorank
 * @param {string} cacheId là buildId của file cache trên hệ thống cryptorank
 * @param {string} projectKey là key của project trên Cryptorank
 * @description Lấy thông tin chi tiết của một Project từ API của Cryptorank
 * @returns trả về thông tin chi tiết của Project dạng json
 */

const getCryptorankProject = async (cacheId, projectKey) => {
  return await axiosServices.get(
    CRYPTO_RANK_PROJECT_URI.replace("${cacheId}", cacheId)
      .replace("${projectKey}", projectKey)
      .replace("${projectKey}", projectKey)
  );
};

export {
  fetchCryptorankProjects,
  fetchCryptorankRounds,
  getCryptorankCacheId,
  getCryptorankProject,
};
