import crypto from "crypto";

const jsonToHash = async (json) => {
  const jsonString = JSON.stringify(json, Object.keys(json).sort());
  return crypto.createHash("sha256").update(jsonString).digest("hex");
};

export { jsonToHash };
