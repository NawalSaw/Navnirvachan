import mongoose from "mongoose";
import { ballotsDB } from "../../db/connectDB.js";

const bulletinSchema = new mongoose.Schema({
  ballotHash: String,
  publishedAt: Date,
});

export const Bulletin = ballotsDB.model("Bulletin", bulletinSchema);
