import { Router } from "express";
import { listHistory, getAnalytics, recordExposure } from "../controllers/history.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const historyRouter = Router();

historyRouter.get("/", requireAuth, asyncHandler(listHistory));
historyRouter.get("/analytics", requireAuth, asyncHandler(getAnalytics));
historyRouter.post("/", requireAuth, asyncHandler(recordExposure));
