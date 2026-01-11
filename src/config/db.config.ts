import mongoose from "mongoose";
import { env } from "./env.config";

export async function connectToDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Mongo connection is successfully");
  } catch (error) {
    console.error("Mongo db connection Error!", error);
    process.exit(1);
  }
}
