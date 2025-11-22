import mongoose from "mongoose";
import { votersDB } from "../../db/connectDB.js";
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  constituency: { type: String, required: true },
  age: { type: Number, required: true },
  registeredAt: Date,
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

adminSchema.methods.generateAccessToken = async function () {
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

let Admin;
export function getAdminModel() {
  if (!Admin) {
    Admin = votersDB.model("Admin", adminSchema);
  }
  return Admin;
}