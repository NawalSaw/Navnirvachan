import mongoose from "mongoose";
import { ballotsDB } from "../../db/connectDB.js";

const tokenMapSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  voterAnonId: { type: String, unique: true },
  used: { type: Boolean, default: false },
  issuedAt: Date,
  usedAt: Date,
  expiresAt: Date,
});

tokenMapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 }); // Expires after 1 hour

let TokenMap;
export function getTokenMapModel() {
  if (!TokenMap) {
    TokenMap = ballotsDB.model("TokenMap", tokenMapSchema);
  }
  return TokenMap;
}
