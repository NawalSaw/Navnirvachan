import { ApiHandler } from "../utils/system/ApiHandler.js";

export const isVerifiedAdmin = ApiHandler(async (req, res, next) => {
  if (req.user.role !== "admin" || !req.user.verified) {
    return res
      .status(401)
      .json({ message: "You Unauthorized to access this resource" });
  }
  next();
});
