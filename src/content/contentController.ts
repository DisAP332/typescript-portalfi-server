import { Request, Response } from "express";
import { Connection, HydratedDocument, Model } from "mongoose";
import DBMethods from "../db";
import { errorMessage } from "../utils/errorMessage";

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
  // prune runs the (potentially expensive) afterRetrieve hook - only
  // getItems (a genuine read) opts in. createItem/deleteItem/updateItem
  // call this afterward just to hand back a fresh list for the UI, and
  // don't need to pay for a prune-and-delete sweep on every write.
  const retrieveItems = async (
    Model: Model<T>,
    { prune = false }: { prune?: boolean } = {}
  ): Promise<IResults> => {
    try {
      let items = await Model.find({});
      if (prune && afterRetrieve) items = await afterRetrieve(items, Model);

      if (!items.length) {
        // response stays an array even when empty - callers embed this
        // directly as `data` for the frontend to .map() over.
        return { success: false, response: [] };
      }
      return { success: true, response: items };
    } catch (error) {
      return { success: false, response: errorMessage(error) };
    }
  };

  const getItems = async (req: Request, res: Response) => {
    try {
      const Model = getModel(DBMethods.getConnection(req.tenant));
      const results = await retrieveItems(Model, { prune: true });
      return res.status(200).json(results);
    } catch (error) {
      const results: IResults = { success: false, response: errorMessage(error) };
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
      let validationError: string | null;
      try {
        validationError = validate(Data);
      } catch {
        // validate() can throw on malformed input (e.g. events' Date isn't
        // a well-formed date string) - without this, that throw would
        // escape uncaught and hit Express's default 500 handler instead
        // of the normal {success,response} envelope.
        return res
          .status(400)
          .json({ success: false, response: `Invalid ${itemLabel} data.` });
      }
      if (validationError) {
        // matches the original events behavior: a rejected-but-well-formed
        // submission (date in the past) is a 200 with success: false, not
        // a 400 - the request itself was fine, the content wasn't.
        return res.status(200).json({ success: false, response: validationError });
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
      const results: IResults = { success: false, response: errorMessage(error) };
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
      const results: IResults = { success: false, response: errorMessage(error) };
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
      let validationError: string | null;
      try {
        validationError = validate(Data);
      } catch {
        return res
          .status(400)
          .json({ success: false, response: `Invalid ${itemLabel} data.` });
      }
      if (validationError) {
        return res.status(200).json({ success: false, response: validationError });
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
      // overwrite() clears every existing path before applying Data, then
      // save() validates the resulting document as a whole - true PUT/
      // full-replace semantics (an omitted required field fails
      // validation, same as the old per-type controllers) generically,
      // instead of item.set(Data)'s partial merge, which silently kept
      // old values for any field a caller omitted. _id/__v are stripped
      // since the frontend's edit form round-trips the whole fetched
      // item, which carries both.
      const { _id, __v, ...replacement } = Data as Record<string, unknown>;
      item.overwrite(replacement);
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
      const results: IResults = { success: false, response: errorMessage(error) };
      res.status(400).json(results);
    }
  };

  return { getItems, createItem, deleteItem, updateItem, retrieveItems };
}
