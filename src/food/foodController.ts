import DBMethods from "../db";
import Food from "./foodModel";
import { IncomingHttpHeaders } from "http";
import { Request, Response } from "express";

interface IRequest extends Request {
  headers: IncomingHttpHeaders & {
    user?: string;
  };
}

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

let results: IResults;

const retrieveFoodItems = async () => {
  try {
    const foodItems = await Food.find({});

    if (foodItems) {
      if (!foodItems.length) {
        results = {
          success: false,
          response: "No food items found!",
        };
      } else {
        results = {
          success: true,
          response: foodItems,
        };
      }
    }
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
  }
};

const getFoodItems = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await retrieveFoodItems();
    return res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    res.status(400).json(results);
  }
};

const createFoodItem = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an food item",
    };
    return res.status(400).json(results);
  }

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const foodItem = new Food(Data);
    await foodItem.save();
    retrieveFoodItems().then(() => {
      results = {
        success: true,
        response: {
          message: `${req.headers.user}: Successful creation of food item ${foodItem._id}`,
          data: results.response,
        },
      };
      return res.status(200).json(results);
    });
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    res.status(400).json(results);
  }
};

const deleteFoodItem = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await Food.findByIdAndDelete({ _id: req.params.id });
    await retrieveFoodItems();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully deleted food item ${req.params.id}`,
        data: results.response,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    res.status(400).json(results);
  }
};

const updateFoodItem = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an food item",
    };
    return res.status(400).json(results);
  }

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const foodItem: any = await Food.findOne({ _id: req.params.id });
    foodItem.Name = Data.Name;
    foodItem.Description = Data.Description;
    foodItem.Cost = Data.Cost;
    foodItem.Sale = Data.Sale;
    foodItem.IsSpecial = Data.IsSpecial;
    foodItem.Tags = Data.Tags;
    foodItem.Type = Data.Type;
    foodItem.Ingredients = Data.Ingredients;
    await foodItem.save();
    await retrieveFoodItems();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully updated food item: ${req.params.id}`,
        data: results.response,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    console.log(error);
    res.status(400).json(results);
  }
};

export default {
  getFoodItems,
  createFoodItem,
  deleteFoodItem,
  updateFoodItem,
  retrieveFoodItems,
};
