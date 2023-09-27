import express from "express";

const router = express.Router();

import drink_controller from "./drinksController";

router.get("/", drink_controller.getDrinkItems);
router.post("/", drink_controller.createDrinkItem);
router.delete("/:id", drink_controller.deleteDrinkItem);
router.put("/:id", drink_controller.updateDrinkItem);

export default router;
