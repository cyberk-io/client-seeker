import axios from "axios";

/**
 * @alias Gửi request đến API với các phương thức GET, POST, PUT, DELETE sử dụng axios
 */
const axiosModule = {
  get: async (url) => {
    return await axios.get(url);
  },
  post: async (url, headers, payload) => {
    return await axios.post(url, headers, payload);
  },
  put: async (url, headers, payload) => {
    return await axios.put(url, headers, payload);
  },
  delete: async (url, headers, payload) => {
    return await axios.delete(url, headers, payload);
  },
};

export default {
  axiosModule,
};
