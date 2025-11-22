import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * signWithHSM
 * Signs a hash using a private key (simulated HSM).
 * In a real HSM, private keys never touch your app.
 */

export async function signWithHSM(hash) {
  try {
    const key = process.env.HMAC_KEY;
    if (!key) throw new Error("HMAC key not configured");

    const signature = crypto
      .createHmac("sha256", key)
      .update(hash)
      .digest("hex");

    return signature;
  } catch (err) {
    console.error("HSM signing error:", err);
    throw new Error("Failed to sign with HSM");
  }
}
