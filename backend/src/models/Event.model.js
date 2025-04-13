import mongoose from "mongoose";

const ClientDetailsSchema = new mongoose.Schema({
  IP: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  postal: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
});

const EventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ClientDetails: ClientDetailsSchema,
  },
  { timestamps: true }
);

EventSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 }); // Expires after 30 days
const Event = mongoose.model("Event", EventSchema);

export default Event;
