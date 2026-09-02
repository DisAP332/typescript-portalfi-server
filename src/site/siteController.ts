import { Request, Response } from "express";
import DBMethods from "../db";
import getSiteModel from "./siteModel";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

const getSitesData = async (req: Request, res: Response) => {
  try {
    const Site = getSiteModel(DBMethods.getConnection(req.tenant));
    const data = await Site.find({});
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};

const postSiteData = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide data",
    };
    return res.status(400).json(results);
  }
  try {
    const Site = getSiteModel(DBMethods.getConnection(req.tenant));
    const site = new Site(Data);
    console.log(site);
    await site.save();
    const results: IResults = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    return res.status(400).json(results);
  }
};

const updateSiteData = async (req: Request, res: Response) => {
  const Data = req.body.Data;

  if (!Data) {
    const results: IResults = {
      success: false,
      response: "You must provide data",
    };
    return res.status(400).json(results);
  }
  try {
    const Site = getSiteModel(DBMethods.getConnection(req.tenant));
    const siteData: any = await Site.findOne({ _id: req.params.id });
    (siteData.Events = Data.Events),
      (siteData.Drinks = Data.Drinks),
      await siteData.save();
    const results: IResults = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: error };
    return res.status(400).json(results);
  }
};

export default {
  getSitesData,
  postSiteData,
  updateSiteData,
};
