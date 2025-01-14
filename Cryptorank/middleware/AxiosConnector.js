import axios from "axios";

export const axiosGet = async (url) => {
  return await axios.get(url);
};
export const axiosPost = async (url, headers, payload) => {
  return await axios.post(url, headers, payload);
};
