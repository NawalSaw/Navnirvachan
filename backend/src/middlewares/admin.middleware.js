import { ApiHandler } from "../utils/ApiHandler.js";

export const isVerifiedAdmin = ApiHandler(async (req, res, next) => {
  if (req.user.role !== "admin" || !req.user.isVerifiedAdmin) {
    return res
      .status(401)
      .json({ message: "You Unauthorized to access this resource" });
  }
  next();
});
