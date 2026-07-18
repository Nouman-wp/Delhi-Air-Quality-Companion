import { Router } from "express";
import { currentAqi, aqiGrid } from "../controllers/aqi.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const aqiRouter = Router();

aqiRouter.get("/current", asyncHandler(currentAqi));
aqiRouter.get("/grid", asyncHandler(aqiGrid));
