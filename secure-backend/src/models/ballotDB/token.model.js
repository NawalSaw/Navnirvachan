import mongoose from "mongoose";
import { ballotsDB } from "../../db/connectDB.js";

const tokenMapSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true },
  voterAnonId: String,
  used: { type: Boolean, default: false },
  issuedAt: Date,
  usedAt: Date,
  expiresAt: Date
});

tokenMapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const TokenMap = ballotsDB.model("TokenMap", tokenMapSchema);
