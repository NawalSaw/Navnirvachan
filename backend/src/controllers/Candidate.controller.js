import Assembly from "../models/assembly.model.js";
import Candidate from "../models/Cadidate.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiHandler } from "../utils/ApiHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/CloudinaryUpload.js";
import { EventLogger } from "../utils/EventLogger.js";
import path from "path";

export const getCandidateById = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const candidate = await Candidate.findById(id);

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  res.json(new ApiResponse(200, candidate, "Candidate found successfully"));
});

export const getAllCandidatesByLocation = ApiHandler(async (req, res) => {
  const district = req.params.location;

  if (!district) {
    throw new ApiError(400, "Location is required");
  }

  // Find the assembly for the given location
  const assembly = await Assembly.findOne({ areasUnder: { $in: district } });
  console.log(assembly);
  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }

  // Fetch all candidates in parallel
  const candidates = await Promise.all(
    assembly.candidates.map(async (candidateId) => {
      return await Candidate.findById(candidateId);
    })
  );

  const cleanedCandidates = candidates.filter((item) => item != null); // removes both null and undefined

  if (!cleanedCandidates.length === 0) {
    throw new ApiError(404, "Candidates not found");
  }

  res.json(new ApiResponse(200, cleanedCandidates, "Candidates found successfully"));
});

export const setCandidate = ApiHandler(async function (req, res) {
  // find the assembly for the given location in the candidate
  const { location, name, party, description } = req.body;
  if (!location || !name || !party || !description) {
    throw new ApiError(400, "All fields are required");
  }
  const image = req.file.path;
  if (!image) {
    throw new ApiError(400, "Image is required");
  }
  const assembly = await Assembly.findOne({ location });

  if (!assembly) {
    throw new ApiError(404, "assembly not found");
  }

  const existingCandidate = await Candidate.findOne({
    name,
    location,
  }).populate("assembly");

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
    description,
    image: imageUrl,
    location,
  });
  // set the candidateId in the array of the candidates in the assembly
  assembly.candidates.push(candidate._id);
  await assembly.save();

  await EventLogger("Candidate created", "Candidate created successfully", req);
  res.json(new ApiResponse(200, candidate, "Candidate created successfully"));
});

export const deleteCandidate = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const candidate = await Candidate.findByIdAndDelete(id);
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }
  EventLogger("Candidate deleted", "Candidate deleted successfully", req);
  res.json(new ApiResponse(200, candidate, "Candidate deleted successfully"));
});

export const createAssembly = ApiHandler(async function (req, res) {
  const { areas, name, state, location } = req.body;
  let candidatesID = [];
  const candidates = await Candidate.find({ location });
  candidates.forEach((candidate) => {
    candidatesID.push(candidate._id);
  });
  const assembly = await Assembly.create({
    name,
    location,
    areasUnder: areas,
    candidates,
    state,
  });
  await EventLogger("Assembly created", "Assembly created successfully", req);
  res.json(new ApiResponse(200, assembly, "Assembly created successfully"));
});

export const deleteAssembly = ApiHandler(async function (req, res) {
  const { id } = req.params;
  const assembly = await Assembly.findByIdAndDelete(id);
  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }
  EventLogger("Assembly deleted", "Assembly deleted successfully", req);
  res.json(new ApiResponse(200, assembly, "Assembly deleted successfully"));
});

export const getAllAssembliesByState = ApiHandler(async function (req, res) {
  const location = req.params.location;
  if (!location) {
    throw new ApiError(400, "Location is required");
  }
  const assemblies = await Assembly.find({ areasUnder: {$in: location} });
  if (!assemblies) {
    throw new ApiError(404, "Assemblies not found");
  }
  res.json(new ApiResponse(200, assemblies, "Assemblies found successfully"));
});
