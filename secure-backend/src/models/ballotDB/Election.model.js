import { ballotsDB } from "../../db/connectDB.js";
import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "2025 General Election"
  code: { type: String, required: true, unique: true }, // e.g., "E001"
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  constituencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Constituency" }], // constituencies in this election
  status: { 
    type: String, 
    enum: ["upcoming", "ongoing", "completed"], 
    default: "upcoming" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const Election = ballotsDB.model("Election", electionSchema);
export function getElectionModel() {
  if (!Election) {
    Election = ballotsDB.model("Election", electionSchema);
  }
  return Election;
}
