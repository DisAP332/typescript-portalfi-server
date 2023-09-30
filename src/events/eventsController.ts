import Event from "./eventsModel";
import DBMethods from "../db";
import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import actions from "./actions";

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

const eventsRetrieval = async () => {
  try {
    const eventsFound = await Event.find({});
    if (eventsFound) {
      if (!eventsFound.length) {
        results = {
          success: false,
          response: [{}],
        };
      } else {
        await actions.deleteExpired(eventsFound).then((events) => {
          results = {
            success: true,
            response: events,
          };
        });
      }
    }
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
  }
  return results;
};

const getEvents = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await eventsRetrieval();
    return res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    return res.status(400).json(results);
  }
};

const createEvent = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an event",
    };
    return res.status(400).json(results);
  }

  const checkDate = actions.checkIfInPast(Data);
  if (checkDate === true) {
    results = {
      success: false,
      response: "Dates cannot be set in the past.",
    };
    return res.status(200).json(results);
  }

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const event = new Event(Data);
    await event.save();
    eventsRetrieval().then((returned) => {
      results = {
        success: true,
        response: {
          message: `${req.headers.user}: Successful creation of event ${event._id}`,
          data: returned.response,
        },
      };
      return res.status(200).json(results);
    });
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    return res.status(400).json(results);
  }
};

const deleteEvent = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    await Event.findByIdAndDelete({ _id: req.params.id });
    await eventsRetrieval();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully deleted event ${req.params.id}`,
        data: results.response,
      },
    };
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    return res.status(400).json(results);
  }
  return res.status(200).json(results);
};

const updateEvent = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide an event",
    };
    return res.status(400).json(results);
  }

  const checkDate = actions.checkIfInPast(Data);
  if (checkDate === true) {
    results = {
      success: false,
      response: "Dates cannot be set in the past.",
    };
    return res.status(200).json(results);
  }

  interface IEvent {
    Date?: string;
    Name?: string;
    Time?: string;
    Description?: string;
    Cost?: string;
  }

  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const eventFound: any = await Event.findOne({ _id: req.params.id });
    eventFound.Date = Data.Date;
    eventFound.Name = Data.Name;
    eventFound.Time = Data.Time;
    eventFound.Description = Data.Description;
    eventFound.Cost = Data.Cost;
    await eventFound.save();
    await eventsRetrieval();
    results = {
      success: true,
      response: {
        message: `${req.headers.user}: Successfully updated event: ${req.params.id}`,
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
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  eventsRetrieval,
};
