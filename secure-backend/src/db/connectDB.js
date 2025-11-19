// connectDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Create DB connections immediately at import
const votersDB = mongoose.createConnection(process.env.MONGODB_URL_VOTERSDB);
const ballotsDB = mongoose.createConnection(process.env.MONGODB_URL_BALLOTSDB);
const auditDB = mongoose.createConnection(process.env.MONGODB_URL_AUDITDB);

// Events
votersDB.on("open", () => console.log("Connected to Voters DB"));
ballotsDB.on("open", () => console.log("Connected to Ballots DB"));
auditDB.on("open", () => console.log("Connected to Audit DB"));

// Dummy async function (optional)
const connectDB = async () => {
  console.log("All DBs initialized");
};

export { votersDB, ballotsDB, auditDB };
export default connectDB;
