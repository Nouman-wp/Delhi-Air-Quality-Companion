import { Router } from "express";
import { compareRoutes } from "../controllers/routes.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const routesRouter = Router();

routesRouter.post("/compare", asyncHandler(compareRoutes));
