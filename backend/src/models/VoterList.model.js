import mongoose from "mongoose"

const VoterSchema = new mongoose.Schema({
 name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    aadhaar: {
        type: String,
        required: true
    }
})
const VoterListSchema = new mongoose.Schema({
    election: {
        type: String,
        unique: true,
        required: true
    },
    voters: [VoterSchema]
})
const VoterList = mongoose.model("VoterList", VoterListSchema);
export default VoterList;
