import express from "express";
import {
  createAssembly,
  deleteAssembly,
  deleteCandidate,
  getAllAssembliesByState,
  getAllCandidatesByLocation,
  getCandidateById,
  setCandidate,
} from "../controllers/Candidate.controller.js";
import { isVerifiedAdmin } from "./../middlewares/admin.middleware.js";
import JWTCheck from "./../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/:location").get(getAllCandidatesByLocation); //
router.route("/:id").get(getCandidateById); //
router
  .route("/")
  .post(JWTCheck, isVerifiedAdmin, upload.single("image"), setCandidate); //
router.route("/:id").delete(JWTCheck, isVerifiedAdmin, deleteCandidate); //
router.route("/assembly").post(JWTCheck, isVerifiedAdmin, createAssembly); //
router.route("/assembly/:id").delete(JWTCheck, isVerifiedAdmin, deleteAssembly); //
router
  .route("/get-all-assembly/:location")
  .get(JWTCheck, isVerifiedAdmin, getAllAssembliesByState);

export default router;
