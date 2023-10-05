import { IncomingHttpHeaders } from "http";
import { Request, Response } from "express";
import Food from "../food/foodModel";
import DBMethods from "../db";
import Drink from "../drinks/drinksModel";
import Event from "../events/eventsModel";
import Site from "./siteModel";

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

const getSitesData = async (req: IRequest, res: Response) => {
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const data = await Site.find({});
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};

const postSiteData = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide data",
    };
    return res.status(400).json(results);
  }
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const site = new Site(Data);
    console.log(site);
    await site.save();
    results = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    return res.status(400).json(results);
  }
};

const updateSiteData = async (req: IRequest, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    results = {
      success: false,
      response: "You must provide data",
    };
    return res.status(400).json(results);
  }
  try {
    await DBMethods.Connect(req.headers.user || "undefined");
    const siteData: any = await Site.findOne({ _id: req.params.id });
    (siteData.Events = Data.Events),
      (siteData.Drinks = Data.Drinks),
      await siteData.save();
    results = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    results = {
      success: false,
      response: error,
    };
    return res.status(400).json(results);
  }
};

export default {
  getSitesData,
  postSiteData,
  updateSiteData,
};
