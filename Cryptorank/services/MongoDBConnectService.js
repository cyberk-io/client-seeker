import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB_COLLECTION = "raw";

export const databaseConnect = async () => {
  await mongoose.connect(process.env.MONGO_URI + DB_COLLECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Database connected");
};
export const databaseDisconnect = async () => {
  await mongoose.disconnect();
};
