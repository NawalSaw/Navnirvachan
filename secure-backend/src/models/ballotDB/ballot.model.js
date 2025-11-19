import { ballotsDB } from "../../db/connectDB.js";
import mongoose from "mongoose";

const ballotSchema = new mongoose.Schema({
  constituency: {type: mongoose.Schema.Types.ObjectId, ref: 'Constituency', required: true},
  epk: Object,               // ephemeral public key (JSON)
  cipher: String,            // AES-GCM ciphertext
  iv: String,
  voterAnonId: String,       // unlinkable via HMAC(voterId, key)
  castAt: { type: Date, default: Date.now },
});


ballotSchema.index({ constituency: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // Expires after 30 days
const Ballot = ballotsDB.model("Ballot", ballotSchema);

export default Ballot;
