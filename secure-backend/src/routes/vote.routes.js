import express from "express";
import JWTCheck from "./../middlewares/auth.middleware.js";
import {
  castVote,
  createElection,
  deleteElection,
  getAllEvents,
  getElectionByConstituency,
  getElectionByConstituencyAdmin,
  getElectionProgress,
  TotalVoteCount,
} from "../controllers/Vote.controller.js";
import { isVerifiedAdmin } from "./../middlewares/admin.middleware.js";
import { AdminApprovalCheck } from "../middlewares/adminApproval.middleware.js";
import { checkElectionActive } from "../middlewares/election.middleware.js";

const router = express.Router();

router.route("/get-election/:constituency").get(getElectionByConstituency); //
router
  .route("/get-election-admin/:constituency")
  .get(JWTCheck, isVerifiedAdmin, getElectionByConstituencyAdmin); //
router.route("/total/:electionID").get(checkElectionActive, TotalVoteCount); //
router.route("/get-all-logs").get(JWTCheck, isVerifiedAdmin, getAllEvents);
router
  .route("/get-election-progress/:electionID")
  .get(JWTCheck, isVerifiedAdmin, checkElectionActive, getElectionProgress);

router.route("/").post(JWTCheck, checkElectionActive, castVote); //
router
  .route("/create-election")
  .post(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("addElection"),
    createElection
  ); //
router
  .route("/delete-election/:id")
  .delete(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("removeElection"),
    deleteElection
  );

export default router;
