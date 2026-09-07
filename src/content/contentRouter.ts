import express, { Request, Response } from "express";

interface ContentController {
  getItems: (req: Request, res: Response) => Promise<unknown>;
  createItem: (req: Request, res: Response) => Promise<unknown>;
  deleteItem: (req: Request, res: Response) => Promise<unknown>;
  updateItem: (req: Request, res: Response) => Promise<unknown>;
}

export function createContentRouter(controller: ContentController) {
  const router = express.Router();

  router.get("/", controller.getItems);
  router.post("/", controller.createItem);
  router.delete("/:id", controller.deleteItem);
  router.put("/:id", controller.updateItem);

  return router;
}
