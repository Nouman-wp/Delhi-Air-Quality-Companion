import { Router } from "express";
import { currentWeather } from "../controllers/weather.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const weatherRouter = Router();

weatherRouter.get("/current", asyncHandler(currentWeather));
