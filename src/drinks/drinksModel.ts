import { Schema, model } from "mongoose";

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

const Drink = model<IDrink>("drink", drinkSchema);

drinkSchema.virtual("url").get(function () {
  return `/drinks/${this._id}`;
});

export default Drink;
