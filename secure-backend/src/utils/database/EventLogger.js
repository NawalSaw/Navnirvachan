import { signWithHSM } from "../../crypto/signWithHSM.js";
import { AuditLog } from "../../models/auditDB/audit.log.model.js";


export const appendAudit = async (eventType, payload, meta) => {
  const payloadHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const latest = await AuditLog.findOne().sort({ _id: -1 }).lean();
  const prevHash = latest ? latest.entryHash : null;

  const entry = {
    timestamp: new Date(),
    eventType,
    payloadHash,
    prevHash,
    meta,
  };
  const entryHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");

  const signature = await signWithHSM(entryHash);

  await AuditLog.create({
    ...entry,
    entryHash,
    signature,
  });

  return { entryHash };
};

