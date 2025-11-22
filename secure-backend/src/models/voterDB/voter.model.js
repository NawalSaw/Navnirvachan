import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { votersDB } from "../../db/connectDB.js";

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true }, // EC-issued ID
    name: { type: String, required: true },
    constituency: { type: String, required: true },
    age: { type: Number, required: true },
    registeredAt: Date,
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    aadhaarID: { type: String, required: true },
    address: { type: String, required: true },
    verified: { type: Boolean, default: false },
    // no tokens, no ballots references — unlinkability requirement
  },
  { timestamps: true }
);

// hash user adhaar ID
voterSchema.pre("save", async function (next) {
  if (!this.isModified("voterId")) return next();
  this.voterId = crypto.createHash("sha256").update(this.voterId).digest("hex");
  this.aadhaarID = crypto.createHash("sha256").update(this.aadhaarID).digest("hex");
  next();
});

// generate access token
voterSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};


voterSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 }); // Expires after 30 days
let Voter;
export function getVoterModel() {
  if (!Voter) {
    Voter = votersDB.model("Voter", voterSchema);
  }
  return Voter;
}
