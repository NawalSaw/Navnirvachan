import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const voterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  permanentAddress: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please use a valid email address"],
    unique: true,
  },
  role: {
    enum: ["voter", "admin"],
    type: String,
    default: "voter",
  },
  isVerifiedAdmin: {
    type: Boolean,
    default: false,
  },
  aadhaarID: {
    type: String,
    unique: true,
  },
  aadhaarIV: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  WorkingAddress: {
    type: String,
    required: true,
  },
});

// hash user adhaar ID
voterSchema.pre("save", async function (next) {
  if (!this.isModified("aadhaarID")) return next();

  const algorithm = "aes-256-cbc";
  const secretKey = Buffer.from(process.env.AES_SECRET_KEY, "hex"); // 32-byte key
  const iv = crypto.randomBytes(16); // 16-byte random IV

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(this.aadhaarID, "utf8", "hex");
  encrypted += cipher.final("hex");

  this.aadhaarID = encrypted;
  this.aadhaarIV = iv.toString("hex");

  next();
});

// voterSchema.methods.getAadhaar = function () {
//   const algorithm = 'aes-256-cbc';
//   const secretKey = Buffer.from(process.env.AES_SECRET_KEY, 'hex'); // 32-byte key
//   const iv = Buffer.from(this.aadhaarIV, 'hex');

//   const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
//   const decrypted = decipher.update(this.aadhaarID, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');

//   return decrypted
// };

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
const Voter = mongoose.model("Voter", voterSchema);
export default Voter;
