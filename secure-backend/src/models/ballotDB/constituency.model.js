import { ballotsDB } from "../../db/connectDB.js";
import mongoose from "mongoose";

const constituencySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // e.g., "C001"
  region: String,   // optional, e.g., state/province
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const Constituency = ballotsDB.model("Constituency", constituencySchema);
export default Constituency;