import { Request, Response } from "express";
import { Connection, HydratedDocument, Model } from "mongoose";
import DBMethods from "../db";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

export interface ContentControllerConfig<T> {
  // used in response messages, e.g. "food item", "drink", "event"
  itemLabel: string;
  getModel: (connection: Connection) => Model<T>;
  // events-only: filters out (and deletes) expired items after a find({})
  afterRetrieve?: (
    items: HydratedDocument<T>[],
    Model: Model<T>
  ) => Promise<HydratedDocument<T>[]>;
  // events-only: rejects a create/update before it touches the DB.
  // returns an error message, or null when the data is valid.
  validate?: (data: any) => string | null;
}

// The four CRUD handlers every content type needs, plus the shared
// retrieval helper they all call after a mutation to return the fresh
// list. Two optional hooks (afterRetrieve, validate) are the only escape
// hatch for type-specific behavior - food and drinks use neither; events
// uses both (see content-types/events.ts).
export function createContentController<T>({
  itemLabel,
  getModel,
  afterRetrieve,
  validate,
}: ContentControllerConfig<T>) {
  const retrieveItems = async (Model: Model<T>): Promise<IResults> => {
    try {
      let items = await Model.find({});
      if (afterRetrieve) items = await afterRetrieve(items, Model);

      if (!items.length) {
        // response stays an array even when empty - callers embed this
        // directly as `data` for the frontend to .map() over.
        return { success: false, response: [] };
      }
      return { success: true, response: items };
    } catch (error) {
      return { success: false, response: error };
    }
  };

  const getItems = async (req: Request, res: Response) => {
    try {
      const Model = getModel(DBMethods.getConnection(req.tenant));
      const results = await retrieveItems(Model);
      return res.status(200).json(results);
    } catch (error) {
      const results: IResults = { success: false, response: error };
      res.status(400).json(results);
    }
  };

  const createItem = async (req: Request, res: Response) => {
    const Data = req.body.Data;

    if (!Data) {
      const results: IResults = {
        success: false,
        response: `You must provide a ${itemLabel}`,
      };
      return res.status(400).json(results);
    }

    if (validate) {
      const error = validate(Data);
      if (error) {
        // matches the original events behavior: a rejected-but-well-formed
        // submission (date in the past) is a 200 with success: false, not
        // a 400 - the request itself was fine, the content wasn't.
        return res.status(200).json({ success: false, response: error });
      }
    }

    try {
      const Model = getModel(DBMethods.getConnection(req.tenant));
      const item = new Model(Data);
      await item.save();
      const retrieved = await retrieveItems(Model);
      const results: IResults = {
        success: true,
        response: {
          message: `${req.tenant}: Successful creation of ${itemLabel} ${item._id}`,
          data: retrieved.response,
        },
      };
      return res.status(200).json(results);
    } catch (error) {
      const results: IResults = { success: false, response: error };
      res.status(400).json(results);
    }
  };

  const deleteItem = async (req: Request, res: Response) => {
    try {
      const Model = getModel(DBMethods.getConnection(req.tenant));
      await Model.findByIdAndDelete(req.params.id);
      const retrieved = await retrieveItems(Model);
      const results: IResults = {
        success: true,
        response: {
          message: `${req.tenant}: Successfully deleted ${itemLabel} ${req.params.id}`,
          data: retrieved.response,
        },
      };
      res.status(200).json(results);
    } catch (error) {
      const results: IResults = { success: false, response: error };
      res.status(400).json(results);
    }
  };

  const updateItem = async (req: Request, res: Response) => {
    const Data = req.body.Data;

    if (!Data) {
      const results: IResults = {
        success: false,
        response: `You must provide a ${itemLabel}`,
      };
      return res.status(400).json(results);
    }

    if (validate) {
      const error = validate(Data);
      if (error) {
        return res.status(200).json({ success: false, response: error });
      }
    }

    try {
      const Model = getModel(DBMethods.getConnection(req.tenant));
      const item = await Model.findById(req.params.id);
      if (!item) {
        const results: IResults = {
          success: false,
          response: `${itemLabel} not found`,
        };
        return res.status(404).json(results);
      }
      item.set(Data);
      await item.save();
      const retrieved = await retrieveItems(Model);
      const results: IResults = {
        success: true,
        response: {
          message: `${req.tenant}: Successfully updated ${itemLabel}: ${req.params.id}`,
          data: retrieved.response,
        },
      };
      res.status(200).json(results);
    } catch (error) {
      const results: IResults = { success: false, response: error };
      res.status(400).json(results);
    }
  };

  return { getItems, createItem, deleteItem, updateItem, retrieveItems };
}
