import { Router } from "express";
import { chat } from "../controllers/chat.controller.js";
import { attachUserIfPresent } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const chatRouter = Router();

chatRouter.post("/", attachUserIfPresent, asyncHandler(chat));
