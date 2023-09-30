import DBMethods from "../db";
import Drink from "./drinksModel";
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

const retrieveDrinkItems = async () => {
  try {
    const drinkItems = await Drink.find({});

    if (drinkItems) {
      if (!drinkItems.length) {
        results = {
          success: false,
          response: [{}],
        };
      } else {
        results = {
          success: true,
          response: drinkItems,
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

const getDrinkItems = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await retrieveDrinkItems();
    return res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    res.status(400).json(results);
  }
};

const createDrinkItem = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an drink",
    };
    return res.status(400).json(results);
  }

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const drinkItem = new Drink(Data);
    await drinkItem.save();
    retrieveDrinkItems().then(() => {
      results = {
        success: true,
        response: {
          message: `${req.headers.user}: Successful creation of drink ${drinkItem._id}`,
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

const deleteDrinkItem = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await Drink.findByIdAndDelete({ _id: req.params.id });
    await retrieveDrinkItems();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully deleted drink ${req.params.id}`,
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

const updateDrinkItem = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an drink",
    };
    return res.status(400).json(results);
  }

  console.log(req.params.id);

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const drinkItem: any = await Drink.findOne({ _id: req.params.id });
    drinkItem.Name = Data.Name;
    drinkItem.Cost = Data.Cost;
    drinkItem.Category = Data.Category;
    drinkItem.Description = Data.Description;
    drinkItem.Ingredients = Data.Ingredients;
    drinkItem.IsSpecial = Data.IsSpecial;
    await drinkItem.save();
    await retrieveDrinkItems();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully updated drink: ${req.params.id}`,
        data: results.response,
      },
    };
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    console.log(error);
    res.status(400).json(results);
  }
  res.status(200).json(results);
};

export default {
  getDrinkItems,
  createDrinkItem,
  deleteDrinkItem,
  updateDrinkItem,
  retrieveDrinkItems,
};
