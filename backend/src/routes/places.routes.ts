import { Router } from "express";
import { nearbyPlaces } from "../controllers/places.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const placesRouter = Router();

placesRouter.get("/nearby", asyncHandler(nearbyPlaces));
