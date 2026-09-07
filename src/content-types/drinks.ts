import { createContentModel } from "../content/contentModel";
import { createContentController } from "../content/contentController";
import { createContentRouter } from "../content/contentRouter";

export interface IDrink {
  Name: string;
  Cost: string;
  Category: string;
  Description: string;
  Ingredients: string;
  IsSpecial: boolean;
}

export const getDrinkModel = createContentModel<IDrink>(
  "drink",
  {
    Name: { type: String, required: true },
    Cost: { type: String, required: true },
    Category: { type: String, required: true },
    Description: { type: String, required: true },
    Ingredients: { type: String, required: false },
    IsSpecial: { type: Boolean, required: true },
  },
  (schema) => {
    schema.virtual("url").get(function () {
      return `/drinks/${this._id}`;
    });
  }
);

const drinksController = createContentController<IDrink>({
  itemLabel: "drink",
  getModel: getDrinkModel,
});

export const drinksRouter = createContentRouter(drinksController);

export default drinksController;
