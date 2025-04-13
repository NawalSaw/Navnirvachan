import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema({
    assemblyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assembly",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
        unique: true,
    },
    isStarted: {
        type: Boolean,
        required: true,
    },
});

const Election = mongoose.model("Election", ElectionSchema);

export default Election;