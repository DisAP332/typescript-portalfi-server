import express from "express";

const router = express.Router();

import food_controller from "./foodController";

router.get("/", food_controller.getFoodItems);
router.post("/", food_controller.createFoodItem);
router.delete("/:id", food_controller.deleteFoodItem);
router.put("/:id", food_controller.updateFoodItem);

export default router;
