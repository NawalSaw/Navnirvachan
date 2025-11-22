import { votersDB } from "../../db/connectDB.js";
import mongoose from "mongoose";
import crypto from "crypto";

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true}, // EC-issued unique voter ID
    image: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String }, // optional, can be hashed
    age: Number,
    gender: String,
    aadhaarID: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { _id: false }
); // _id false to avoid auto ObjectId for each subdocument

const voterListSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  constituency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Constituency",
    required: true,
  },
  voters: { type: [voterSchema], default: [] }, // array of voter objects
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});// 69214ef2082d179afe6c26ff 691fd95dd296a9d4ab60bd23

// Optional index to ensure no duplicate voterId within same election+constituency
voterListSchema.index(
  { election: 1, constituency: 1},
  { unique: true }
);
voterListSchema.pre("save", function (next) {
  if (!this.isModified("voters")) return next();
  this.voters.map(
    (voter) =>
      (voter.voterId = crypto
        .createHash("sha256")
        .update(voter.voterId)
        .digest("hex"))
  );
  this.updatedAt = Date.now();
  next();
});

voterListSchema.statics.compareVoterId = async function (voterId) {
  const hashedId = crypto.createHash("sha256").update(voterId).digest("hex");
  const voterList = await this.findOne({
    "voters.voterId": hashedId,
  });
  return voterList;
};

let VoterList;
export function getVoterListModel() {
  if (!VoterList) {
    VoterList = votersDB.model("VoterList", voterListSchema);
  }
  return VoterList;
}
