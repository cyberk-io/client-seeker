import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbCollection = {
  mongodb: "raw",
};
/**
 * @alias Kết nối đến MongoDB
 */
const mongoDB = {
  connect: async () => {
    await mongoose.connect(process.env.MONGO_URI + dbCollection.mongodb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected");
  },
  disconnect: async () => {
    await mongoose.disconnect();
  },
};

export default {
  mongoDB,
};
