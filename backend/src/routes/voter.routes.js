import express from "express";
import {
  addAdmin,
  addVotersInVoterlist,
  deleteAdminById,
  getAllAdmins,
  getByIdAdmin,
  GetCandidateWorks,
  getCurrentVoter,
  getOTP,
  getVotersByElection,
  registerVoter,
  SendUserOTP,
  verifyAdmin,
} from "../controllers/Voter.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
import { isVerifiedAdmin } from "./../middlewares/admin.middleware.js";
import JWTCheck from "./../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/current").get(JWTCheck, getCurrentVoter); //
router.route("/register").post(upload.single("image"), registerVoter); //
router.route("/get-user-otp").post(SendUserOTP);

router.route("/get-all-voters/:assemblyID").get(JWTCheck, isVerifiedAdmin, getVotersByElection);
router.route("/admin/:id").get(JWTCheck, isVerifiedAdmin, getByIdAdmin); //
router
  .route("/add-admin") //
  .post(JWTCheck, isVerifiedAdmin, upload.single("image"), addAdmin);
router.route("/admin/:id").delete(JWTCheck, isVerifiedAdmin, deleteAdminById);
router.route("/get-all-admins").get(getAllAdmins);
router.route("/verify-admin").post(upload.single("image"), verifyAdmin);
router.route("/get-admin-otp").post(getOTP);
router
  .route("/add-voters")
  .post(JWTCheck, isVerifiedAdmin, upload.single("data"), addVotersInVoterlist);

router.route("/candidate/works").post(GetCandidateWorks);



export default router;
