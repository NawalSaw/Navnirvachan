import Candidate from "../models/Cadidate.model.js";
import Election from "../models/Election.model.js";
import Voter from "../models/voter.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiHandler } from "../utils/ApiHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Vote from "./../models/vote.model.js";
import Assembly from "./../models/assembly.model.js";
import { EventLogger } from "../utils/EventLogger.js";
import Event from "../models/Event.model.js";
import VoterList from "../Voterlist.json" with {type: "json"}

export const castVote = ApiHandler(async (req, res) => {
  const { voterID, candidateID } = req.body;

  if (!voterID) {
    throw new ApiError(400, "voterID is required");
  }

  const isExistingVote = await Vote.findOne({ voterID });
  if (isExistingVote) {
    throw new ApiError(400, "You have already voted");
  }

  if (!candidateID) {
    throw new ApiError(400, "candidateID is required");
  }

  const candidate = await Candidate.findOne({ _id: candidateID });
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  const location = candidate.location;

  const election = await Election.findOne({ location });
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  if (!election.isStarted) {
    throw new ApiError(400, "Election has not started yet");
  }

  const assembly = await Assembly.findOne({ location }).exec();
  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }

  const vote = new Vote({
    voterID,
    candidateID,
    assemblyID: assembly._id,
    electionID: election._id,
  });
  vote
    .save()
    .then((result) => {
      res
        .clearCookie("token")
        .json(new ApiResponse(200, result, "Vote casted successfully"));
    })
    .catch((err) => {
      console.log("❌ Vote casting error:", err);
      throw new ApiError(500, "Vote casting failed", err);
    });
});

export const TotalVoteCount = ApiHandler(async (req, res) => {
  const { electionID } = req.params;

  // Get all votes and populate candidate details
  const allVotes = await Vote.find({ electionID }).populate("candidateID");

  if (!allVotes || allVotes.length === 0) {
    throw new ApiError(404, "No votes found");
  }

  // Count votes per candidate
  const results = {};

  console.log(allVotes[0]);
  allVotes.forEach((vote) => {
    const candidate = vote.candidateID;
    const candidateId = candidate._id.toString();

    if (!results[candidateId]) {
      results[candidateId] = {
        candidate,
        votes: 1,
      };
    } else {
      results[candidateId].votes++;
    }
  });

  console.log(results);
  // Format response
  const formattedResults = Object.values(results).map(({ candidate, votes }) => ({
    id: candidate._id.toString(),
    name: candidate.name,
    party: candidate.party,
    description: candidate.description || "",
    location: candidate.location,
    image: candidate.image,
    votes,
  }));

  // Optional cleanup: delete voters not in the election
  await Voter.deleteMany({
    role: "voter",
    id: { $nin: allVotes.map((vote) => vote.voterID) },
  });

  res.json(
    new ApiResponse(200, formattedResults, "Vote count fetched successfully")
  );
});


// on election end delete all votes and voters and deleteElection
// on voteCast and the voterRegister etc check if election is open
export const ToggleElection = ApiHandler(async (req, res) => {
  const { id } = req.params;
  const election = await Election.findById(id);

  if (!id) {
    throw new ApiError(400, "All fields are required");
  }

  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  election.isStarted = !election.isStarted;
  await election.save();

  if (election.isStarted) {
    await EventLogger("Election started", "Election started successfully", req);
    res.json(new ApiResponse(200, election, "Election started successfully"));
  } else {
    await EventLogger("Election ended", "Election ended successfully", req);
    res
      .clearCookie("token")
      .json(new ApiResponse(200, election, "Election ended successfully"));
  }
});

export const createElection = ApiHandler(async (req, res) => {
  const { location, name } = req.body;
  console.log(location, name);
  if (!location || !name) {
    throw new ApiError(400, "All fields are required");
  }
  const existingElection = await Election.findOne({ location });
  if (existingElection) {
    throw new ApiError(400, "Election already exists");
  }

  const existingAssembly = await Assembly.findOne({ location });
  if (!existingAssembly) {
    throw new ApiError(404, "Assembly not found create assembly first");
  }
  const election = new Election({
    location,
    name,
    isStarted: false,
    assemblyID: existingAssembly._id,
  });
  if (!election) {
    throw new ApiError(404, "election not found");
  }
  await election.save();
  await EventLogger("Election created", "Election created successfully", req);
  res.json(new ApiResponse(200, election, "Election created successfully"));
});

export const deleteElection = ApiHandler(async (req, res) => {
  const { id } = req.params;
  const election = await Election.findByIdAndDelete(id);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }
  await EventLogger("Election deleted", "Election deleted successfully", req);
  res.json(new ApiResponse(200, election, "Election deleted successfully"));
});

export const GetElectionByLocation = ApiHandler(async (req, res) => {
  const { location } = req.params;
  
  const assembly = await Assembly.findOne({ areasUnder: { $in: location } });

  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }

  const election = await Election.findOne({ assemblyID: assembly._id });

  if (!election) {
    throw new ApiError(404, "Election not found");
  }


  if (!election.isStarted) {
    throw new ApiError(400, "Election has not started yet");
  }

  res.json(new ApiResponse(200, election, "Election found successfully"));
});

export const getElectionProgress = ApiHandler(async (req, res) => {
  const { electionID } = req.params;
  const votesCount = (await Vote.find({ electionID })).length;
  const allVotersInVoterList = VoterList.length;

  if (!votesCount || !allVotersInVoterList) {
    throw new ApiError(404, "Votes not found");
  }

  const percentage = (votesCount / allVotersInVoterList) * 100; // Calculate the percentage

  res.json(
    new ApiResponse(
      200,
      { votesCount, allVotersInVoterList, percentage },
      "Votes found successfully"
    )
  );
});

export const getAllEvents = ApiHandler(async (req, res) => {
  const events = await Event.find({}).limit(20);

  if (!events) {
    throw new ApiError(404, "Events not found");
  }

  res.json(new ApiResponse(200, events, "Events found successfully"));
});

export const getAllVotes = ApiHandler(async (req, res) => {
  const { electionID } = req.params;

  if (!electionID) {
    throw new ApiError(400, "Election ID is required");
  }

  const votes = await Vote.find({ electionID }).select("-voterID -candidateID -assemblyID");

  if (!votes) {
    throw new ApiError(404, "Votes not found");
  }

  res.json(new ApiResponse(200, votes, "Votes found successfully"));
});


export const getElectionByLocationAdmin = ApiHandler(async (req, res) => {
  const { location } = req.params;
  
  const assembly = await Assembly.findOne({ areasUnder: { $in: location } });

  if (!assembly) {
    throw new ApiError(404, "Assembly not found");
  }

  const election = await Election.findOne({ assemblyID: assembly._id });

  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  res.json(new ApiResponse(200, election, "Election found successfully"));
});