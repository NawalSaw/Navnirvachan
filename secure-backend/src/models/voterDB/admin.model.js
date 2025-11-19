import mongoose from "mongoose";
import { votersDB } from "../../db/connectDB.js";

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

const Admin = votersDB.model("Admin", adminSchema);

export default Admin;