import { auditDB } from "../../db/connectDB.js";
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, required: true, trim: true, case: "lowercase" },
  payloadHash: { type: String, required: true, trim: true },
  prevHash: { type: String, required: true, trim: true },
  meta: { type: Object, default: {} },
  entryHash: { type: String, required: true, trim: true },
  signature: { type: String, required: true, trim: true },
});

// no updates allowed — enforced by permissions, not schema

let AuditLog;
export function getAuditLogModel() {
  if (!AuditLog) {
    AuditLog = auditDB.model("AuditLog", auditLogSchema);
  }
  return AuditLog;
}
  