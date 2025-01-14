import crypto from "crypto";
import { axiosGet } from "./middleware/AxiosConnector";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

export const hashJson = async (jsonData) => {
  const jsonString = JSON.stringify(jsonData, Object.keys(jsonData).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};

export const sendNotifi = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
  return axiosGet(url);
};
