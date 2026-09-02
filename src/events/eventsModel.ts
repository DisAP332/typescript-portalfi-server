import { Schema, Connection, Model } from "mongoose";

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

eventSchema.virtual("url").get(function () {
  return `/events/${this._id}`;
});

const MODEL_NAME = "Event";

const getEventModel = (connection: Connection): Model<IEvent> =>
  (connection.models[MODEL_NAME] as Model<IEvent>) ??
  connection.model<IEvent>(MODEL_NAME, eventSchema);

export default getEventModel;
