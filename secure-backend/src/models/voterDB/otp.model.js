import mongoose from "mongoose";
import crypto from "crypto";
import { votersDB } from "../../db/connectDB.js";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 }); 

otpSchema.pre("save", function (next) {
  if (this.isModified("otp")) {
    // Hash OTP before saving
    this.otp = crypto.createHash("sha256").update(this.otp).digest("hex");
  }
  next();
});

otpSchema.methods.compareOTP = function (otp) {
  return this.otp === crypto.createHash("sha256").update(otp).digest("hex");
};

let OTP;
export function getOTPModel() {
  if (!OTP) {
    OTP = votersDB.model("OTP", otpSchema);
  }
  return OTP;
}
