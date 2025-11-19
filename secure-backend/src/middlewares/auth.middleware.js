import Voter from "../models/voterDB/voter.model.js";
import jwt from "jsonwebtoken";
import { ApiHandler } from "../utils/system/ApiHandler.js";
import Admin from "../models/voterDB/admin.model.js";

const JWTCheck = ApiHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers?.authorization?.split(" ")[1];

    if (req.user && req.user.verified) {
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: "you are not registered" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const user = await Voter.findById(decoded._id);
    if (!user) {
      const admin = await Admin.findById(decoded._id);
      if (!admin) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = admin;
      req.role = "admin";
      return next();
    }

    req.user = user;
    req.role = "voter";
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Authentication failed" });
  }
});

export default JWTCheck;
