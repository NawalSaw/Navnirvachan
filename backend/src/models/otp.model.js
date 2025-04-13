import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 }); 
const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
