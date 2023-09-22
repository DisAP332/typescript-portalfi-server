import express from "express";

const router = express.Router();

import events_controller from "./eventsController";

router.get("/", events_controller.getEvents);
router.post("/", events_controller.createEvent);
router.delete("/:id", events_controller.deleteEvent);
router.put("/:id", events_controller.updateEvent);

export default router;
