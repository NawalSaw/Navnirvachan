import express from "express";
import {
  addAdmin,
  addAdminApprovalRequest,
  addVotersInVoterlist,
  approveAdminApprovalRequest,
  deleteAdminById,
  getAdminApprovalRequests,
  getAllAdmins,
  getByIdAdmin,
  GetCandidateWorks,
  getCurrentVoter,
  getOTP,
  getVotersByElection,
  logout,
  registerVoter,
  rejectAdminApprovalRequest,
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
  .route("/get-all-voters/:electionID")
  .get(JWTCheck, isVerifiedAdmin, checkElectionActive, getVotersByElection);
router.route("/admin/:id").get(JWTCheck, isVerifiedAdmin, getByIdAdmin); //
router.route("/get-all-admins/:constituency").get(getAllAdmins);
router.route("/approval-request/").get(JWTCheck, isVerifiedAdmin, getAdminApprovalRequests);

router.route("/approval-request").post(JWTCheck, isVerifiedAdmin, addAdminApprovalRequest);
router.route("/approval-request/:id/approve").post(JWTCheck, isVerifiedAdmin, approveAdminApprovalRequest);
router.route("/approval-request/:id/reject").post(JWTCheck, isVerifiedAdmin, rejectAdminApprovalRequest);

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
router.route("/candidate/works").get(GetCandidateWorks);
router.route("/log-out").post(JWTCheck, isVerifiedAdmin, logout);

export default router;
