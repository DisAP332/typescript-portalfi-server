import { HydratedDocument, Model } from "mongoose";
import { createContentModel } from "../content/contentModel";
import { createContentController } from "../content/contentController";
import { createContentRouter } from "../content/contentRouter";

export interface IEvent {
  Date: string;
  Name: string;
  Time: string;
  Description: string;
  Cost: string;
}

export const getEventModel = createContentModel<IEvent>(
  "Event",
  {
    Date: { type: String, required: true },
    Name: { type: String, required: true },
    Time: { type: String, required: true },
    Description: { type: String, required: true },
    Cost: { type: String, required: true },
  },
  (schema) => {
    schema.virtual("url").get(function () {
      return `/events/${this._id}`;
    });
  }
);

// dates are stored as "YYYY-MM-DD"; comparing them as plain numbers after
// stripping the dashes sorts correctly without needing a date library.
function toComparableDate(date: string) {
  return Number(date.replace(/-/g, ""));
}

function todayAsComparableDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

function isInPast(date: string) {
  return toComparableDate(date) < todayAsComparableDate();
}

const eventsController = createContentController<IEvent>({
  itemLabel: "event",
  getModel: getEventModel,
  afterRetrieve: async (items, Model: Model<IEvent>) => {
    const surviving: HydratedDocument<IEvent>[] = [];
    for (const item of items) {
      if (isInPast(item.Date)) {
        await Model.findByIdAndDelete(item._id);
      } else {
        surviving.push(item);
      }
    }
    return surviving;
  },
  validate: (data) =>
    isInPast(data.Date) ? "Dates cannot be set in the past." : null,
});

export const eventsRouter = createContentRouter(eventsController);

export default eventsController;
