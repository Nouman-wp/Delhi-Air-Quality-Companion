import { Router } from "express";
import { notifications } from "../controllers/notifications.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", asyncHandler(notifications));
