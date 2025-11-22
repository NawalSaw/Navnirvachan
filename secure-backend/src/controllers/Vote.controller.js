import { getAdminApprovalRequestModel } from "../models/auditDB/adminApprovalRequest.model.js";
import { getAuditLogModel } from "../models/auditDB/audit.log.model.js";
import { getCandidateModel } from "../models/ballotDB/candidate.model.js";
import { getVoterModel } from "../models/voterDB/voter.model.js";
import { getElectionModel } from "../models/ballotDB/Election.model.js";
import { getVoterListModel } from "../models/voterDB/VoterList.model.js";
import { getBallotModel } from "./../models/ballotDB/ballot.model.js";
import { getConstituencyModel } from "./../models/ballotDB/constituency.model.js";
import { getTokenMapModel } from "./../models/ballotDB/token.model.js";
import { getBulletinModel } from "./../models/ballotDB/bulletin.model.js";

const Ballot = getBallotModel();
const Constituency = getConstituencyModel();
const TokenMap = getTokenMapModel();
const Bulletin = getBulletinModel();
const Election = getElectionModel();
const VoterList = getVoterListModel();
const Candidate = getCandidateModel();
const Voter = getVoterModel();
const AuditLog = getAuditLogModel();
const AdminApprovalRequest = getAdminApprovalRequestModel();

import { encryptVote, generateAnonId } from "../crypto/vote_encryption.js";
import { appendAudit } from "../utils/database/EventLogger.js";
import { ApiError } from "../utils/system/ApiError.js";
import { ApiResponse } from "../utils/system/ApiResponse.js";
import { ApiHandler } from "../utils/system/ApiHandler.js";
import crypto from "crypto";

function hashBallot(ballot) {
  const data =
    ballot.cipher +
    ballot.iv +
    ballot.voterAnonId +
    ballot.constituency.toString();

  return crypto.createHash("sha256").update(data).digest("hex");
}

export const castVote = ApiHandler(async (req, res) => {
  const { constituency, vote, tokenId } = req.body;
  console.log({ constituency, vote, tokenId });
  if (!constituency || !vote || !tokenId) {
    throw new ApiError(400, "constituency, vote, and tokenId are required");
  }
  // 1️⃣ Validate token
  const tokenEntry = await TokenMap.findOne({ tokenId });

  if (!tokenEntry) {
    throw new ApiError(400, "Invalid token");
  }

  if (tokenEntry.used) {
    throw new ApiError(400, "This token has already been used");
  }

  if (tokenEntry.expiresAt < new Date()) {
    throw new ApiError(400, "Token has expired");
  }

  // 2️⃣ Mark token as used (so user cannot vote twice)
  tokenEntry.used = true;
  tokenEntry.usedAt = new Date();
  await tokenEntry.save();

  // 3️⃣ Get the anonymous voter ID
  const voterAnonId = tokenEntry.voterAnonId;

  // Encrypt vote
  const { cipher, iv } = encryptVote(vote);

  // Ephemeral public key placeholder (can be generated per voter if needed)
  const epk = { kty: "EC", crv: "P-256", x: "placeholder", y: "placeholder" };

  const constituencyInDatabase = await Constituency.findOne({
    name: constituency,
  });
  if (!constituencyInDatabase) {
    throw new ApiError(404, "Constituency not found");
  }

  // Save ballot
  const ballot = new Ballot({
    constituency: constituencyInDatabase._id, // Store constituency ID
    epk,
    cipher,
    iv,
    voterAnonId,
    castAt: new Date(),
  });

  await ballot.save();

  // Create ballot hash
  const ballotHash = hashBallot(ballot);

  // Publish on bulletin board
  const bulletin = await Bulletin.create({
    electionID: tokenEntry.electionId,
    ballotHash,
    publishedAt: new Date(),
  });

  res.json(
    new ApiResponse(
      201,
      { ballotId: ballot._id, ballotHash, bulletinId: bulletin._id },
      "Vote cast successfully and published on bulletin board"
    )
  );
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
  if (
    constituency.status !== "completed" ||
    constituency.endDate < new Date()
  ) {
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
  const { code, name, description, startDate, endDate, constituenciesNames } =
    req.body;

  if (
    !code ||
    !name ||
    !description ||
    !startDate ||
    !endDate ||
    !constituenciesNames
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (startDate > endDate) {
    throw new ApiError(400, "Start date must be before end date");
  }

  const constituencies = await Constituency.find({
    name: { $in: constituenciesNames },
  });

  if (constituencies.length !== constituenciesNames.length) {
    throw new ApiError(400, "One or more constituencies not found");
  }

  const existingElection = await Election.find({
    constituencies: { $in: constituencies.map((c) => c._id) },
    status: "ongoing",
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
    constituencies: constituencies.map((c) => c._id),
    status:
      startDate > new Date()
        ? "upcoming"
        : endDate < new Date()
        ? "completed"
        : "ongoing",
  });
  await election.save();

  const payload = {
    code,
    name,
    description,
    startDate,
    endDate,
    constituencies,
    status: election.status,
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

  const constituencyInDatabase = await Constituency.findOne({
    name: constituency,
  });
  if (!constituencyInDatabase) {
    throw new ApiError(404, "Constituency not found");
  }

  const election = await Election.findOne({
    constituencies: { $in: [constituencyInDatabase._id] },
    status: "ongoing",
  }).populate("constituencies");

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
  const votesCount = voters?.length || 0;
  const allVotersInVoterList = await VoterList.find({ election: electionID });
  const total = allVotersInVoterList?.voters?.length || 0;
  const percentage = (votesCount / total) * 100 || 0;

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

export const issueToken = ApiHandler(async (req, res) => {
  const { voterId, electionId } = req.body;

  if (!voterId || !electionId) {
    throw new ApiError(400, "voterId and electionId are required");
  }

  // 2️⃣ Ensure voter exists (optional depending on your system)
  const voter = await Voter.findOne({ voterId });
  if (!voter) {
    throw new ApiError(404, "Voter not found");
  }

  const election = await Election.findById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  const voterConstituency = await Constituency.findOne({
    name: voter.constituency,
  });
  if (!election.constituencies.includes(voterConstituency._id)) {
    throw new ApiError(403, "Voter does not belong to this constituency");
  }

  // 3️⃣ Generate hashed anonymous ID FIRST
  const voterAnonId = generateAnonId(voterId);

  // 4️⃣ Check if hashed anon ID already has a token for this election
  const existingToken = await TokenMap.findOne({
    electionId,
    voterAnonId,
  });

  if (existingToken) {
    throw new ApiError(
      400,
      "Token already issued for this voter in this election"
    );
  }

  // 5️⃣ Generate a new token
  const tokenId = crypto.randomUUID();

  // 6️⃣ Expiration time (optional)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // 7️⃣ Save token entry
  await TokenMap.create({
    tokenId,
    electionId,
    voterAnonId,
    issuedAt: new Date(),
    expiresAt,
  });

  return res.json(
    new ApiResponse(201, { tokenId, expiresAt }, "Token issued successfully")
  );
});

export const getTokenId = ApiHandler(async (req, res) => {
  const { voterId, electionID } = req.params;
  if (!voterId || !electionID) {
    throw new ApiError(400, "voterId and electionId are required");
  }
  const voterAnonId = generateAnonId(voterId);

  const token = await TokenMap.findOne({
    electionId: electionID,
    voterAnonId,
    used: false,
  });
  if (!token) {
    throw new ApiError(404, "Token not found");
  }
  res.json(new ApiResponse(200, token.tokenId, "Token found successfully"));
});

export const getAllBulletins = ApiHandler(async (req, res) => {
  const { electionID } = req.params;
  if (!electionID) {
    throw new ApiError(400, "Election ID is required");
  }
  const bulletin = await Bulletin.find({ electionID });
  if (!bulletin) {
    throw new ApiError(404, "Ballots not found");
  }
  res.json(new ApiResponse(200, bulletin, "Ballots found successfully"));
});
