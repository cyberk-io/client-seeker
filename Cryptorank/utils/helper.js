import crypto from "crypto";
const request = (await import("../config/request.js")).default;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

/**
 * @alias Chuyển đổi chuỗi json thành hash
 * @param {*} json
 * @returns trả về hash từ chuỗi json đầu vào
 */
const jsonToHash = async (json) => {
  const jsonString = JSON.stringify(json, Object.keys(json).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};

/**
 * @alias Gửi thông báo đến Telegram
 * @param {string} message
 * @returns trả về kết quả gửi thông báo đến Telegram
 */
const telegramNotification = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
  return request.axiosModule.get(url);
};

export default {
  jsonToHash,
  telegramNotification,
};
