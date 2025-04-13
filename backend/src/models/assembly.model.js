import mongoose from "mongoose";

const assemblySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    unique: true,
    required: true,
  },
  areasUnder: {
    type: [String], // ["dhanbad", "giridih"]
    required: true,
  },
  candidates: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Candidate",
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const Assembly = mongoose.model("Assembly", assemblySchema);    

export default Assembly;