import { Router } from "express";
import { register, login, logout, me, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, asyncHandler(me));
authRouter.patch("/profile", requireAuth, asyncHandler(updateProfile));
