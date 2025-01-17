import axios from "axios";

/**
 * @alias Gửi request đến API với các phương thức GET, POST, PUT, DELETE sử dụng axios
 */

const axiosServices = {
  get: (url) => {
    return axios.get(url);
  },
  post: (url, headers, payload) => {
    return axios.post(url, headers, payload);
  },
  put: (url, headers, payload) => {
    return axios.put(url, headers, payload);
  },
  delete: (url, headers, payload) => {
    return axios.delete(url, headers, payload);
  },
};

export { axiosServices };
