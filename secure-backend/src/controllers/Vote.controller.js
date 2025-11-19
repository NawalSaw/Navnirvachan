import { encryptVote, generateAnonId } from "../crypto/vote_encryption.js";
import { AdminApprovalRequest } from "../models/auditDB/adminApprovalRequest.model.js";
import { AuditLog } from "../models/auditDB/audit.log.model.js";
import Candidate from "../models/ballotDB/candidate.model.js";
import Election from "../models/ballotDB/Election.model.js";
import Voter from "../models/voterDB/voter.model.js";
import VoterList from "../models/voterDB/VoterList.model.js";
import { appendAudit } from "../utils/database/EventLogger.js";
import { ApiError } from "../utils/system/ApiError.js";
import { ApiResponse } from "../utils/system/ApiResponse.js";
import { ApiHandler } from "../utils/system/ApiHandler.js";
import Ballot from "./../models/ballotDB/ballot.model.js";
import Constituency from "./../models/ballotDB/constituency.model.js";

export const castVote = ApiHandler(async (req, res) => {
  const { constituency, vote, voterId } = req.body;

  if (!constituency || !vote || !voterId) {
    throw new ApiError(400, "constituency, vote, and voterId are required");
  }

  // Encrypt vote
  const { cipher, iv } = encryptVote(vote);

  // Generate anonymous voter ID
  const voterAnonId = generateAnonId(voterId);

  // Ephemeral public key placeholder (can be generated per voter if needed)
  const epk = { kty: "EC", crv: "P-256", x: "placeholder", y: "placeholder" };

  const constituencyID = await Constituency.findOne({ name: constituency });
  const election = await Election.findOne({ $in: {constituencies: constituencyID._id } });
  if (!election) {
    throw new ApiError(404, "Election not found");
  }
  if (!constituencyID) {
    throw new ApiError(404, "Constituency not found");
  }

  if (election.status !== "ongoing" || election.endDate < new Date()|| election.startDate > new Date()) {
    throw new ApiError(400, "Election is not ongoing or has ended");
  }

  // Save ballot
  const ballot = new Ballot({
    constituency: constituencyID._id, // Store constituency ID
    epk,
    cipher,
    iv,
    voterAnonId,
    castAt: new Date(),
  });

  await ballot.save();

  res.json(new ApiResponse(201, ballot, "Vote cast successfully"));
});

export const TotalVoteCount = ApiHandler(async (req, res) => {
  const { electionID } = req.body; // AES key used to decrypt votes
  const aesKeyHex = process.env.AES_KEY;

  // Fetch ballots for this election
  const constituency = await Election.findById(electionID).populate(
    "constituencies"
  );
  if (!constituency || constituency.constituencies.length === 0) {
    throw new ApiError(404, "Constituency not found");
  }
  if (constituency.status !== "completed" || constituency.endDate < new Date()) {
    throw new ApiError(400, "Election not completed");
  }

  const ballots = await Ballot.find({
    constituency: { $in: constituency.constituencies.map((c) => c._id) },
  });
  if (!ballots || ballots.length === 0) {
    return res.status(404).json({ message: "No ballots found" });
  }

  // Count votes per candidate
  const results = {};

  for (const ballot of ballots) {
    const candidateId = decryptAESGCM(
      ballot.cipher,
      ballot.iv,
      Buffer.from(aesKeyHex, "hex")
    );

    if (!results[candidateId]) {
      results[candidateId] = 1;
    } else {
      results[candidateId]++;
    }
  }

  // Fetch candidate details
  const candidateIds = Object.keys(results);
  const candidates = await Candidate.find({ _id: { $in: candidateIds } });

  const formattedResults = candidates.map((candidate) => ({
    id: candidate._id.toString(),
    name: candidate.name,
    party: candidate.party,
    description: candidate.description || "",
    location: candidate.location,
    image: candidate.image,
    votes: results[candidate._id.toString()] || 0,
  }));

  const payload = {
    constituency: constituency.name,
    results: formattedResults,
  };

  const meta = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };

  await appendAudit("Vote count fetched", payload, meta);
  res.status(200).json({
    message: "Vote count fetched successfully",
    data: formattedResults,
  });
});

export const createElection = ApiHandler(async (req, res) => {
  // approval request
  const { constituency } = req.body;
  const approvalRequest = await AdminApprovalRequest.findOne({
    constituency,
    request: "createElection",
    status: "approved",
    requestedBy: req.user._id,
  });
  if (!approvalRequest) {
    throw new ApiError(
      400,
      "No pending approval request for this constituency"
    );
  }

  const { code, name, description, startDate, endDate, constituencies } =
    req.body;

  if (
    !code ||
    !name ||
    !description ||
    !startDate ||
    !endDate ||
    !constituencies
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (startDate > endDate) {
    throw new ApiError(400, "Start date must be before end date");
  }

  const existingElection = await Election.findOne({
    $or: [{ code }, { $in: constituencies }],
  });
  if (existingElection) {
    throw new ApiError(400, "Election already exists");
  }
  const election = new Election({
    code,
    name,
    description,
    startDate,
    endDate,
    constituencies,
    status:
      startDate > new Date()
        ? "upcoming"
        : endDate < new Date()
        ? "completed"
        : "ongoing",
  });
  await election.save();

  payload = {
    code,
    name,
    description,
    startDate,
    endDate,
    constituencies,
    status: election.status,
  };
  meta = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Election created", payload, meta);
  res.json(new ApiResponse(200, election, "Election created successfully"));
});

export const deleteElection = ApiHandler(async (req, res) => {
  // approval request
  const { constituency } = req.body;
  const approvalRequest = await AdminApprovalRequest.findOne({
    constituency,
    request: "deleteElection",
    status: "approved",
    requestedBy: req.user._id,
  });
  if (!approvalRequest) {
    throw new ApiError(
      400,
      "No pending approval request for this constituency"
    );
  }

  const { id } = req.params;
  const election = await Election.findByIdAndDelete(id);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }
  payload = {
    code: election.code,
    name: election.name,
    description: election.description,
    startDate: election.startDate,
    endDate: election.endDate,
    constituencies: election.constituencies,
    status: election.status,
  };
  meta = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    location: req.headers["x-forwarded-for"],
    browser: req.headers["user-agent"],
    os: req.headers["os"],
    requestedBy: req.user._id,
    time: new Date().toISOString(),
  };
  await appendAudit("Election deleted", payload, meta);
  res.json(new ApiResponse(200, election, "Election deleted successfully"));
});

export const getElectionByConstituency = ApiHandler(async (req, res) => {
  const { constituency } = req.params;

  const Constituency = await Constituency.findOne({ name: constituency });
  if (!Constituency) {
    throw new ApiError(404, "Constituency not found");
  }

  const election = await Election.findOne({
    $in: { constituencies: Constituency._id },
  });

  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  if (
    election.status !== "ongoing" ||
    election.startDate > new Date() ||
    election.endDate < new Date()
  ) {
    throw new ApiError(400, "Election is not ongoing or has ended");
  }

  res.json(new ApiResponse(200, election, "Election found successfully"));
});

export const getElectionProgress = ApiHandler(async (req, res) => {
  const { electionID } = req.params;

  if (!electionID) {
    throw new ApiError(400, "Election ID is required");
  }

  const voters = await Voter.find({ electionID });
  const votesCount = voters.length;
  const allVotersInVoterList = (await VoterList.find({ election: electionID })).voters.length;
  const percentage = (votesCount / allVotersInVoterList) * 100;
  res.json(
    new ApiResponse(
      200,
      { votesCount, allVotersInVoterList, percentage },
      "Votes found successfully"
    )
  );
});

export const getAllEvents = ApiHandler(async (req, res) => {
  const events = await AuditLog.find({}).limit(40);

  if (!events) {
    throw new ApiError(404, "Events not found");
  }

  res.json(new ApiResponse(200, events, "Events found successfully"));
});

export const getElectionByConstituencyAdmin = ApiHandler(async (req, res) => {
  const { constituency } = req.params;

  const Constituency = await Constituency.findOne({ name: constituency });
  if (!Constituency) {
    throw new ApiError(404, "Constituency not found");
  }

  const election = await Election.findOne({
    $in: { constituencies: Constituency._id },
  });

  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  res.json(new ApiResponse(200, election, "Election found successfully"));
});
