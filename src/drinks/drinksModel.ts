import { Schema, Connection, Model } from "mongoose";

interface IDrink {
  Name: string;
  Cost: string;
  Category: string;
  Description: string;
  Ingredients: string;
  IsSpecial: boolean;
}

const drinkSchema = new Schema<IDrink>({
  Name: {
    type: String,
    required: true,
  },
  Cost: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Ingredients: {
    type: String,
    required: false,
  },
  IsSpecial: {
    type: Boolean,
    required: true,
  },
});

drinkSchema.virtual("url").get(function () {
  return `/drinks/${this._id}`;
});

const MODEL_NAME = "drink";

const getDrinkModel = (connection: Connection): Model<IDrink> =>
  (connection.models[MODEL_NAME] as Model<IDrink>) ??
  connection.model<IDrink>(MODEL_NAME, drinkSchema);

export default getDrinkModel;
