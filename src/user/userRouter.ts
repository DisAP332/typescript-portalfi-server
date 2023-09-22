import express from "express";
import cookieParser from "cookie-parser";

const router = express.Router();

router.use(cookieParser());

import user_controller from "./userController";

router.post("/login", user_controller.loginUser);

export default router;
