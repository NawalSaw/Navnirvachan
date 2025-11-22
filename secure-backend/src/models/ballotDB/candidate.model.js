import { ballotsDB } from "../../db/connectDB.js";
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String },
  image: { type: String, required: true },
  constituency: { type: mongoose.Schema.Types.ObjectId, ref: "Constituency", required: true },
  candidateCode: { type: String, unique: true }, // optional short code
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

let Candidate;
export function getCandidateModel() {
  if (!Candidate) {
    Candidate = ballotsDB.model("Candidate", candidateSchema);
  }
  return Candidate;
}
