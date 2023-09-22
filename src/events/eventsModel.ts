import { Schema, model } from "mongoose";

interface IEvent {
  Date: string;
  Name: string;
  Time: string;
  Description: string;
  Cost: string;
}

const eventSchema = new Schema<IEvent>({
  Date: {
    type: String,
    required: true,
    ref: "eventDate",
  },
  Name: {
    type: String,
    required: true,
    ref: "eventName",
  },
  Time: {
    type: String,
    required: true,
    ref: "eventOpens",
  },
  Description: {
    type: String,
    required: true,
    ref: "eventDescription",
  },
  Cost: {
    type: String,
    required: true,
    ref: "eventCost",
  },
});

const Event = model<IEvent>("Event", eventSchema);

eventSchema.virtual("url").get(function () {
  return `/events/${this._id}`;
});

export default Event;
