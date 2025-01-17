import crypto from "crypto";

/**
 * @alias Chuyển đổi chuỗi json thành hash
 * @param {*} json
 * @returns trả về hash từ chuỗi json đầu vào
 */
const jsonToHash = async (json) => {
  const jsonString = JSON.stringify(json, Object.keys(json).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};

export { jsonToHash };
