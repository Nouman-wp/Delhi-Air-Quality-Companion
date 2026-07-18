import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth.service.js";

function extractToken(req: Request): string | null {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  req.userId = payload.userId;
  next();
}

export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (payload) req.userId = payload.userId;
  next();
}
