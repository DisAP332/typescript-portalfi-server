import express from "express";
import cookieParser from "cookie-parser";

const router = express.Router();

router.use(cookieParser());

import site_controller from "./siteController";

router.get("/", site_controller.getSitesData);
router.post("/", site_controller.postSiteData);
router.put("/:id", site_controller.updateSiteData);

export default router;
