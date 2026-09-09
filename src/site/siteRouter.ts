import express from "express";
import cookieParser from "cookie-parser";
import verifyJWT from "../auth/verifyJWT";
import site_controller from "./siteController";

const router = express.Router();

router.use(cookieParser());

// only the dashboard's own read/write routes require the venue's session -
// the public route is meant for the venue's separate public-facing website,
// which has no session cookie and identifies itself by tenant in the URL.
router.get("/public/:tenant", site_controller.getPublicSiteData);
router.get("/", verifyJWT, site_controller.getSitesData);
router.post("/", verifyJWT, site_controller.postSiteData);
router.put("/:id", verifyJWT, site_controller.updateSiteData);

export default router;
