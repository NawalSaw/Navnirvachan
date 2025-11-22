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

// let votersDB, ballotsDB, auditDB;

// async function connectDB() {
//   try {
//     votersDB = mongoose.createConnection(process.env.MONGODB_URL_VOTERSDB);
//     ballotsDB = mongoose.createConnection(process.env.MONGODB_URL_BALLOTSDB);
//     auditDB = mongoose.createConnection(process.env.MONGODB_URL_AUDITDB);

//     await Promise.all([
//       new Promise((res) => votersDB.once("open", res)),
//       new Promise((res) => ballotsDB.once("open", res)),
//       new Promise((res) => auditDB.once("open", res)),
//     ]);

//     console.log("All DBs connected");
//     return { votersDB, ballotsDB, auditDB };
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// export { votersDB, ballotsDB, auditDB };
// export default connectDB;
