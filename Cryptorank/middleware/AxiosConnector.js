import axios from "axios";

const axiosGet = async (url) => {
  return await axios.get(url);
};
const axiosPost = async (url, headers, payload) => {
  return await axios.post(url, headers, payload);
};

export default {
  axiosGet,
  axiosPost,
};
