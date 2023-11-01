import express from "express";
import user_controller from "./userController";

const router = express.Router();

router.post("/login", user_controller.loginUser);

export default router;
