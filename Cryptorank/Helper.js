import crypto from "crypto";
const AxiosModule = (await import("./middleware/AxiosConnector.js")).default;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

/*
 * This function is used to hash the json data
 * 1. Convert the json data to string
 * 2. Sort the keys of the json data
 * 3. Hash the string
 * 4. Return the hash
 */
const hashJson = async (jsonData) => {
  const jsonString = JSON.stringify(jsonData, Object.keys(jsonData).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};
/*
 * This function is used to send notification to telegram
 * 1. Convert the message to string
 * 2. Send the message to telegram
 * 3. Return the response
 */
const sendNotifi = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
  return AxiosModule.axiosGet(url);
};

export default {
  hashJson,
  sendNotifi,
};
