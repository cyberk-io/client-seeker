import { axiosServices } from "./axiosServices.js";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

const URL_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=`;

const sendNewMessageToTelegram = async (message) => {
  const url = URL_BASE + `${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
  return axiosServices.get(url);
};
const sendErrorMessageToTelegram = async (message) => {
  const url = URL_BASE + `${TELEGRAM_BOT_CHAT_ID}&text=${message}`;
  return axiosServices.get(url);
};

export { sendNewMessageToTelegram, sendErrorMessageToTelegram };
