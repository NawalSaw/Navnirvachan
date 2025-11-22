import mongoose from "mongoose";
import { auditDB } from "../../db/connectDB.js";

const adminApprovalRequestSchema = new mongoose.Schema({
  request: {
    type: String,
    enum: [
      "addAdmin",
      "removeAdmin",
      "addConstituency",
      "removeConstituency",
      "toggleElection",
      "addElection",
      "removeElection",
      "addVoter",
      "removeVoter",
      "addCandidate",
      "removeCandidate",
    ],
    required: true,
  },
  constituency: { type: String, required: true },
  approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" }],
  rejections: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

adminApprovalRequestSchema.index(
  { createdAt: 1 },
  { expires: 60 * 60 * 1000 * 24 }
); // expires in 1 hour

let AdminApprovalRequest;
export function getAdminApprovalRequestModel() {
  if (!AdminApprovalRequest) {
    AdminApprovalRequest = auditDB.model(
      "AdminApprovalRequest",
      adminApprovalRequestSchema
    );
  }
  return AdminApprovalRequest;
}
