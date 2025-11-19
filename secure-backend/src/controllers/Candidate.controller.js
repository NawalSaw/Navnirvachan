import Candidate from "../models/ballotDB/candidate.model.js";
import { ApiError } from "../utils/system/ApiError.js";
import { ApiResponse } from "../utils/system/ApiResponse.js";
import { ApiHandler } from "../utils/system/ApiHandler.js";
import { uploadToCloudinary } from "../utils/third_party/CloudinaryUpload.js";
import path from "path";
import { appendAudit } from "../utils/database/EventLogger.js";
import Constituency from "../models/ballotDB/constituency.model.js";

export const getCandidateById = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const candidate = await Candidate.findById(id);

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  res.json(new ApiResponse(200, candidate, "Candidate found successfully"));
});

export const getAllCandidatesByConstituency = ApiHandler(async (req, res) => {
  const constituency = req.params.constituency;

  if (!constituency) {
    throw new ApiError(400, "Constituency is required");
  }

  const candidates = await Candidate.find({ constituency });
  if (!candidates.length) {
    throw new ApiError(404, "Candidates not found");
  }

  res.json(new ApiResponse(200, candidates, "Candidates found successfully"));
});

export const setCandidate = ApiHandler(async function (req, res) {
  // find the assembly for the given constituency in the candidate
  const { constituency, name, party, candidateCode } = req.body;
  if (!constituency || !name || !party || !candidateCode) {
    throw new ApiError(400, "All fields are required");
  }

  const image = req.file.path;
  if (!image) {
    throw new ApiError(400, "Image is required");
  }

  const existingCandidate = await Candidate.findOne({
    name,
    constituency,
  });
  if (existingCandidate) {
    throw new ApiError(400, "Candidate already exists");
  }

  const localImagePath = path.resolve(image);
  const imageUrl = await uploadToCloudinary(localImagePath);

  if (!imageUrl) {
    throw new ApiError(500, "Image upload failed");
  }

  // create a new candidate
  const candidate = await Candidate.create({
    name,
    party,
    image: imageUrl,
    constituency,
    candidateCode: candidateCode,
  });

  const payload = {
    name,
    party,
    image: imageUrl,
    constituency,
    candidateCode: candidateCode,
  };
  const metadata = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Candidate created", payload, metadata);
  res.json(new ApiResponse(200, candidate, "Candidate created successfully"));
});

export const deleteCandidate = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }
  const payload = {
    name: candidate.name,
    constituency: candidate.constituency,
  };
  const metadata = {
    ip: req.ip,
    location: req.headers["x-forwarded-for"] || "",
    browser: req.headers["user-agent"] || "",
    os: req.headers["os"] || "",
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Candidate deleted", payload, metadata);
  res.json(new ApiResponse(200, candidate, "Candidate deleted successfully"));
});

export const createConstituency = ApiHandler(async function (req, res) {
  const { name, code, region } = req.body;
  
  if (!name || !code) {
    throw new ApiError(400, "All fields are required");
  }

  // create a new constituency
  const constituency = await Constituency.create({
    name,
    code,
    region: region || "",
  });
  
  const payload = {
    name,
    code,
    region: region || "",
  };
  const metadata = {
    ip: req.ip,
    location: req.headers["x-forwarded-for"] || "",
    browser: req.headers["user-agent"] || "",
    os: req.headers["os"] || "",
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Constituency created", payload, metadata);
  res.json(new ApiResponse(200, constituency, "Constituency created successfully"));
});

export const deleteConstituency = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const constituency = await Constituency.findByIdAndDelete(id);
  if (!constituency) {
    throw new ApiError(404, "Constituency not found");
  }

  const payload = {
    name: constituency.name,
    code: constituency.code,
  };
  const metadata = {
    ip: req.ip,
    location: req.headers["x-forwarded-for"] || "",
    browser: req.headers["user-agent"] || "",
    os: req.headers["os"] || "",
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Constituency deleted", payload, metadata);
  res.json(new ApiResponse(200, constituency, "Constituency deleted successfully"));
});
