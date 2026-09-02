import DBMethods from "../db";
import getDrinkModel from "./drinksModel";
import { Request, Response } from "express";
import { Model } from "mongoose";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

const retrieveDrinkItems = async (Drink: Model<any>): Promise<IResults> => {
  try {
    const drinkItems = await Drink.find({});

    if (!drinkItems.length) {
      return {
        success: false,
        response: [{}],
      };
    }
    return {
      success: true,
      response: drinkItems,
    };
  } catch (error) {
    return {
      success: false,
      response: error,
    };
  }
};

const getDrinkItems = async (req: Request, res: Response) => {
  try {
    const Drink = getDrinkModel(DBMethods.getConnection(req.tenant));
    const results = await retrieveDrinkItems(Drink);
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const createDrinkItem = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an drink",
    };
    return res.status(400).json(results);
  }

  try {
    const Drink = getDrinkModel(DBMethods.getConnection(req.tenant));
    const drinkItem = new Drink(Data);
    await drinkItem.save();
    const retrieved = await retrieveDrinkItems(Drink);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successful creation of drink ${drinkItem._id}`,
        data: retrieved.response,
      },
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const deleteDrinkItem = async (req: Request, res: Response) => {
  try {
    const Drink = getDrinkModel(DBMethods.getConnection(req.tenant));
    await Drink.findByIdAndDelete({ _id: req.params.id });
    const retrieved = await retrieveDrinkItems(Drink);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully deleted drink ${req.params.id}`,
        data: retrieved.response,
      },
    };
    res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    res.status(400).json(results);
  }
};

const updateDrinkItem = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an drink",
    };
    return res.status(400).json(results);
  }

  console.log(req.params.id);

  try {
    const Drink = getDrinkModel(DBMethods.getConnection(req.tenant));
    const drinkItem: any = await Drink.findOne({ _id: req.params.id });
    drinkItem.Name = Data.Name;
    drinkItem.Cost = Data.Cost;
    drinkItem.Category = Data.Category;
    drinkItem.Description = Data.Description;
    drinkItem.Ingredients = Data.Ingredients;
    drinkItem.IsSpecial = Data.IsSpecial;
    await drinkItem.save();
    const retrieved = await retrieveDrinkItems(Drink);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully updated drink: ${req.params.id}`,
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
  getDrinkItems,
  createDrinkItem,
  deleteDrinkItem,
  updateDrinkItem,
  retrieveDrinkItems,
};
