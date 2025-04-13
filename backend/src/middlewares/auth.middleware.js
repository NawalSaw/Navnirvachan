import Voter from "./../models/voter.model.js";
import jwt from "jsonwebtoken";
import { ApiHandler } from "../utils/ApiHandler.js";

const JWTCheck = ApiHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers?.authorization?.split(" ")[1];
    
    if (req.user && req.user.isVerifiedAdmin) {
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
      return res.status(401).json({ message: "User not found z" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Authentication failed" });
  }
});

export default JWTCheck;
