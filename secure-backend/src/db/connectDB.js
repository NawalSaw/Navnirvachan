import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const votersDB = mongoose.createConnection(process.env.MONGODB_URL_VOTERSDB);
export const ballotsDB = mongoose.createConnection(process.env.MONGODB_URL_BALLOTSDB);
export const auditDB = mongoose.createConnection(process.env.MONGODB_URL_AUDITDB);

votersDB.on("open", () => console.log("Connected to Voters DB"));
ballotsDB.on("open", () => console.log("Connected to Ballots DB"));
auditDB.on("open", () => console.log("Connected to Audit DB"));

export default async function connectDB() {
  console.log("All DBs initialized");
}
