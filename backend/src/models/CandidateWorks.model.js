import mongoose from "mongoose";

const candidateWorksSchema = new mongoose.Schema({
  candidateID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  works: {
    type: [String],
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

candidateWorksSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 * 12 }); // Expires after 30 days
const CandidateWorks = mongoose.model("CandidateWorks", candidateWorksSchema);

export default CandidateWorks;
