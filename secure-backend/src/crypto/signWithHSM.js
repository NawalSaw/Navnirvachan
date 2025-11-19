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
    const privateKey = process.env.HSM_PRIVATE_KEY; // PEM text stored in env

    if (!privateKey) {
      throw new Error("HSM private key not configured");
    }

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(hash);
    signer.end();

    const signature = signer.sign(privateKey, "hex");
    return signature;
  } catch (err) {
    console.error("HSM signing error:", err);
    throw new Error("Failed to sign with HSM");
  }
}
