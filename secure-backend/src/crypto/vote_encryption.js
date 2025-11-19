import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const AES_KEY = Buffer.from(process.env.AES_KEY, "hex");
const HMAC_KEY = Buffer.from(process.env.HMAC_KEY, "hex");

// Encrypt vote with AES-GCM
export function encryptVote(plainText) {
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    cipher: encrypted + ":" + tag,
    iv: iv.toString("hex"),
  };
}
// Example AES decryption function
export function decryptAESGCM(cipherHex, ivHex, key) {
  const [encryptedText, authTagHex] = cipherHex.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted; // e.g., candidate ID as string
}

// Generate voterAnonId via HMAC
export function generateAnonId(voterId) {
  return crypto.createHmac("sha256", HMAC_KEY).update(voterId).digest("hex");
}
