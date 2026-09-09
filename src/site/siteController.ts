import { Request, Response } from "express";
import DBMethods from "../db";
import getSiteModel from "./siteModel";
import { errorMessage } from "../utils/errorMessage";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

// the venue's own dashboard - authenticated, req.tenant comes from the
// session cookie.
const getSitesData = async (req: Request, res: Response) => {
  try {
    const Site = getSiteModel(DBMethods.getConnection(req.tenant));
    const data = await Site.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ success: false, response: errorMessage(error) });
  }
};

// the venue's public-facing website - no session cookie available, so the
// tenant comes from the URL instead. Read-only, and only ever serves data
// this same venue already chose to publish via postSiteData/updateSiteData.
const getPublicSiteData = async (req: Request, res: Response) => {
  try {
    // req.params values are typed string | string[] to account for
    // repeated route segments elsewhere in Express - :tenant never repeats.
    const tenant = Array.isArray(req.params.tenant)
      ? req.params.tenant[0]
      : req.params.tenant;
    const Site = getSiteModel(DBMethods.getConnection(tenant));
    const data = await Site.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ success: false, response: errorMessage(error) });
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
    await site.save();
    const results: IResults = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: errorMessage(error) };
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
    const siteData = await Site.findById(req.params.id);
    if (!siteData) {
      const results: IResults = { success: false, response: "site data not found" };
      return res.status(404).json(results);
    }
    siteData.Events = Data.Events;
    siteData.Drinks = Data.Drinks;
    await siteData.save();
    const results: IResults = {
      success: true,
      response: "successfully published data",
    };
    return res.status(200).json(results);
  } catch (error) {
    const results: IResults = { success: false, response: errorMessage(error) };
    return res.status(400).json(results);
  }
};

export default {
  getSitesData,
  getPublicSiteData,
  postSiteData,
  updateSiteData,
};
