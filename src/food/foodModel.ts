import { Schema, Connection, Model } from "mongoose";

interface IFood {
  Name: string;
  Description: string;
  Cost: number;
  Sale: {
    is: boolean;
    percentage: number;
  };
  IsSpecial: boolean;
  Tags: {
    spicy: boolean;
    raw: boolean;
    allergens: boolean;
  };
  Type: string;
  Ingredients: string;
}

const foodSchema = new Schema<IFood>({
  Name: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Cost: {
    type: Number,
    required: true,
  },
  Sale: {
    Is: {
      type: Boolean,
      required: true,
    },
    Percentage: {
      type: Number,
      required: true,
    },
  },
  IsSpecial: {
    type: Boolean,
    required: true,
  },
  Tags: {
    Spicy: {
      type: Boolean,
      required: true,
    },
    Raw: {
      type: Boolean,
      required: true,
    },
    Allergens: {
      type: Boolean,
      required: true,
    },
  },
  Type: {
    type: String,
    required: true,
  },
  Ingredients: {
    type: String,
    requireid: true,
  },
});

foodSchema.virtual("url").get(function () {
  return `/food/${this._id}`;
});

const MODEL_NAME = "food";

// a per-tenant connection is cached (useDb useCache: true) and reused
// across requests, so model() can only be called on it once - registering
// again on the same connection throws OverwriteModelError.
const getFoodModel = (connection: Connection): Model<IFood> =>
  (connection.models[MODEL_NAME] as Model<IFood>) ??
  connection.model<IFood>(MODEL_NAME, foodSchema);

export default getFoodModel;
