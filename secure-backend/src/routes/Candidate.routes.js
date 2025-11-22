import express from "express";
import {
  createConstituency,
  deleteConstituency,
  deleteCandidate,
  getAllCandidatesByConstituency,
  getCandidateById,
  setCandidate,
  getConstituencyById,
} from "../controllers/Candidate.controller.js";
import { isVerifiedAdmin } from "./../middlewares/admin.middleware.js";
import JWTCheck from "./../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AdminApprovalCheck } from "../middlewares/adminApproval.middleware.js";

const router = express.Router();

router.route("/:constituency").get(getAllCandidatesByConstituency); //
router.route("/:id").get(getCandidateById); //
router
  .route("/")
  .post(
    JWTCheck,
    isVerifiedAdmin,
    upload.single("image"),
    AdminApprovalCheck("setCandidate"),
    setCandidate
  ); //
router
  .route("/:id")
  .delete(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("removeCandidate"),
    deleteCandidate
); //
  router.route("/constituency/:name").get(getConstituencyById); //
router
  .route("/constituency")
  .post(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("addConstituency"),
    createConstituency
  ); //
router
  .route("/constituency/:id")
  .delete(
    JWTCheck,
    isVerifiedAdmin,
    AdminApprovalCheck("removeConstituency"),
    deleteConstituency
  ); //

export default router;
