import { Schema, model } from "mongoose";

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
    is: {
      type: Boolean,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  IsSpecial: {
    type: Boolean,
    required: true,
  },
  Tags: {
    spicy: {
      type: Boolean,
      required: true,
    },
    raw: {
      type: Boolean,
      required: true,
    },
    allergens: {
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

const Food = model<IFood>("food", foodSchema);

foodSchema.virtual("url").get(function () {
  return `/food/${this._id}`;
});

export default Food;
