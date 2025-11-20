import Election from "../models/ballotDB/Election.model.js";

export const checkElectionActive = async (req, res, next) => {
  const { electionID } = req.params || req.body;

  const election = await Election.findById(electionID);
  if (!election) return res.status(404).json({ msg: "Election not found" });
  
  const now = new Date();

  if (now < election.startDate)
    return res.status(403).json({ msg: "Election has not started yet" });

  if (now > election.endDate)
    return res.status(403).json({ msg: "Election has ended" });

  next(); // continue to cast vote
};
