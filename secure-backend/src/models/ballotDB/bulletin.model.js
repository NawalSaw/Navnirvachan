import mongoose from "mongoose";
import { ballotsDB } from "../../db/connectDB.js";

const bulletinSchema = new mongoose.Schema({
  electionID: { type: String, required: true },
  ballotHash: String,
  publishedAt: Date,
});

let Bulletin;
export function getBulletinModel() {
  if (!Bulletin) {
    Bulletin = ballotsDB.model("Bulletin", bulletinSchema);
  }
  return Bulletin;
}