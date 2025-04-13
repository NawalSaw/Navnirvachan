import express from "express";
import JWTCheck from "./../middlewares/auth.middleware.js";
import {
  castVote,
  createElection,
  deleteElection,
  getAllEvents,
  getAllVotes,
  GetElectionByLocation,
  getElectionByLocationAdmin,
  getElectionProgress,
  ToggleElection,
  TotalVoteCount,
} from "../controllers/Vote.controller.js";
import { isVerifiedAdmin } from "./../middlewares/admin.middleware.js";

const router = express.Router();

router.route("/get-election/:location").get(GetElectionByLocation); //
router.route("/get-election-admin/:location").get(JWTCheck, isVerifiedAdmin, getElectionByLocationAdmin); //
router.route("/total/:electionID").get(TotalVoteCount); //
router.route("/").post(JWTCheck, castVote); //
router.route("/toggle-election/:id").post(JWTCheck, isVerifiedAdmin, ToggleElection); //
router.route("/create-election").post(JWTCheck, isVerifiedAdmin, createElection); //
router.route("/get-all-event").get(JWTCheck, isVerifiedAdmin, getAllEvents);
router.route("/get-election-progress/:electionID").get(JWTCheck, isVerifiedAdmin, getElectionProgress);
router.route("/delete-election/:id").delete(JWTCheck, isVerifiedAdmin, deleteElection);
router.route("/get-all-votes/:electionID").get(JWTCheck, isVerifiedAdmin, getAllVotes);

export default router;
