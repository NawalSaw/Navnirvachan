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
import { AdminApprovalCheck } from "../middlewares/adminApproval.middleware.js";
import { checkElectionActive } from "../middlewares/election.middleware.js";

const router = express.Router();

router.route("/current").get(JWTCheck, getCurrentVoter); //
router
  .route("/get-all-voters/:election")
  .get(JWTCheck, isVerifiedAdmin, checkElectionActive, getVotersByElection);
router.route("/admin/:id").get(JWTCheck, isVerifiedAdmin, getByIdAdmin); //
router.route("/get-all-admins/:constituency").get(getAllAdmins);

router.route("/register").post(upload.single("image"), registerVoter); //
router.route("/get-user-otp").post(SendUserOTP);
router
  .route("/add-admin") //
  .post(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("addAdmin"),
    upload.single("image"),
    addAdmin
  );
router
  .route("/admin/:id")
  .delete(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("removeAdmin"),
    deleteAdminById
  );
router.route("/verify-admin").post(upload.single("image"), verifyAdmin);
router.route("/get-admin-otp").post(getOTP);
router
  .route("/add-voters")
  .post(
    JWTCheck,
    isVerifiedAdmin,
    upload.single("data"),
    AdminApprovalCheck("addVoters"),
    addVotersInVoterlist
  );
router.route("/candidate/works").post(GetCandidateWorks);

export default router;
