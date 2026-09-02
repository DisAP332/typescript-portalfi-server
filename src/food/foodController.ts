import DBMethods from "../db";
import getFoodModel from "./foodModel";
import { Request, Response } from "express";
import { Model } from "mongoose";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

const retrieveFoodItems = async (Food: Model<any>): Promise<IResults> => {
  try {
    const foodItems = await Food.find({});

    if (!foodItems.length) {
      return {
        success: false,
        response: "No food items found!",
      };
    }
    return {
      success: true,
      response: foodItems,
    };
  } catch (error) {
    return {
      success: false,
      response: error,
    };
  }
};

const getFoodItems = async (req: Request, res: Response) => {
  try {
    const Food = getFoodModel(DBMethods.getConnection(req.tenant));
    const results = await retrieveFoodItems(Food);
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const createFoodItem = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an food item",
    };
    return res.status(400).json(results);
  }

  try {
    const Food = getFoodModel(DBMethods.getConnection(req.tenant));
    const foodItem = new Food(Data);
    await foodItem.save();
    const retrieved = await retrieveFoodItems(Food);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successful creation of food item ${foodItem._id}`,
        data: retrieved.response,
      },
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const deleteFoodItem = async (req: Request, res: Response) => {
  try {
    const Food = getFoodModel(DBMethods.getConnection(req.tenant));
    await Food.findByIdAndDelete({ _id: req.params.id });
    const retrieved = await retrieveFoodItems(Food);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully deleted food item ${req.params.id}`,
        data: retrieved.response,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const updateFoodItem = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an food item",
    };
    return res.status(400).json(results);
  }

  try {
    const Food = getFoodModel(DBMethods.getConnection(req.tenant));
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
    const retrieved = await retrieveFoodItems(Food);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully updated food item: ${req.params.id}`,
        data: retrieved.response,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
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
