import { Router } from "express";
import { search } from "../controllers/search.controller.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(search));
