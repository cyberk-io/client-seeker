import crypto from "crypto";

const jsonToHash = (json) => {
  const jsonString = JSON.stringify(json, Object.keys(json).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { jsonToHash, sleep };
