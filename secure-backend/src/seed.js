import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const voterId = "E4454783259";

const hashedId = crypto.createHmac("sha256", process.env.HMAC_KEY).update(voterId).digest("hex");
console.log(hashedId);