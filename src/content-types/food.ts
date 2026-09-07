import { createContentModel } from "../content/contentModel";
import { createContentController } from "../content/contentController";
import { createContentRouter } from "../content/contentRouter";

export interface IFood {
  Name: string;
  Description: string;
  Cost: number;
  Sale: {
    Is: boolean;
    Percentage: number;
  };
  IsSpecial: boolean;
  Tags: {
    Spicy: boolean;
    Raw: boolean;
    Allergens: boolean;
  };
  Type: string;
  Ingredients: string;
}

export const getFoodModel = createContentModel<IFood>(
  "food",
  {
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    Cost: { type: Number, required: true },
    Sale: {
      Is: { type: Boolean, required: true },
      Percentage: { type: Number, required: true },
    },
    IsSpecial: { type: Boolean, required: true },
    Tags: {
      Spicy: { type: Boolean, required: true },
      Raw: { type: Boolean, required: true },
      Allergens: { type: Boolean, required: true },
    },
    Type: { type: String, required: true },
    // was `requireid: true` - a typo Mongoose silently ignores as an
    // unknown option, so this field was never actually required.
    Ingredients: { type: String, required: true },
  },
  (schema) => {
    schema.virtual("url").get(function () {
      return `/food/${this._id}`;
    });
  }
);

const foodController = createContentController<IFood>({
  itemLabel: "food item",
  getModel: getFoodModel,
});

export const foodRouter = createContentRouter(foodController);

export default foodController;
