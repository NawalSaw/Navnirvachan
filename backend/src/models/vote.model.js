import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voter",
      required: true,
    },
    candidateID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cadidate",
      required: true,
    },
    assemblyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assembly",
      required: true,
    },
    electionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

voteSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // Expires after 30 days
const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
