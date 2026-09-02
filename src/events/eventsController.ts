import getEventModel from "./eventsModel";
import DBMethods from "../db";
import { Request, Response } from "express";
import actions from "./actions";
import { Model } from "mongoose";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

const eventsRetrieval = async (Event: Model<any>): Promise<IResults> => {
  try {
    const eventsFound = await Event.find({});
    if (!eventsFound.length) {
      return {
        success: false,
        response: [{}],
      };
    }
    const surviving = await actions.deleteExpired(eventsFound, Event);
    return {
      success: true,
      response: surviving,
    };
  } catch (error) {
    return {
      success: false,
      response: error,
    };
  }
};

const getEvents = async (req: Request, res: Response) => {
  try {
    const Event = getEventModel(DBMethods.getConnection(req.tenant));
    const results = await eventsRetrieval(Event);
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    return res.status(400).json(results);
  }
};

const createEvent = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an event",
    };
    console.log(results);
    return res.status(400).json(results);
  }

  const checkDate = actions.checkIfInPast(Data);
  if (checkDate === true) {
    const results: IResults = {
      success: false,
      response: "Dates cannot be set in the past.",
    };
    return res.status(200).json(results);
  }

  try {
    const Event = getEventModel(DBMethods.getConnection(req.tenant));
    const event = new Event(Data);
    await event.save();
    const retrieved = await eventsRetrieval(Event);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successful creation of event ${event._id}`,
        data: retrieved.response,
      },
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    console.log(results);
    return res.status(400).json(results);
  }
};

const deleteEvent = async (req: Request, res: Response) => {
  try {
    const Event = getEventModel(DBMethods.getConnection(req.tenant));
    await Event.findByIdAndDelete({ _id: req.params.id });
    const retrieved = await eventsRetrieval(Event);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully deleted event ${req.params.id}`,
        data: retrieved.response,
      },
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    return res.status(400).json(results);
  }
};

const updateEvent = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide an event",
    };
    return res.status(400).json(results);
  }

  const checkDate = actions.checkIfInPast(Data);
  if (checkDate === true) {
    const results: IResults = {
      success: false,
      response: "Dates cannot be set in the past.",
    };
    return res.status(200).json(results);
  }

  try {
    const Event = getEventModel(DBMethods.getConnection(req.tenant));
    const eventFound: any = await Event.findOne({ _id: req.params.id });
    eventFound.Date = Data.Date;
    eventFound.Name = Data.Name;
    eventFound.Time = Data.Time;
    eventFound.Description = Data.Description;
    eventFound.Cost = Data.Cost;
    await eventFound.save();
    const retrieved = await eventsRetrieval(Event);
    const results: IResults = {
      success: true,
      response: {
        message: `${req.tenant}: Successfully updated event: ${req.params.id}`,
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
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  eventsRetrieval,
};
