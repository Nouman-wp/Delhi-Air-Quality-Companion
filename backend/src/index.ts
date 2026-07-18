import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { initDataStore } from "./services/dataStore.js";
import { seedPlaces } from "./services/places.service.js";
import { seedAdvisories } from "./services/advisories.service.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

import { authRouter } from "./routes/auth.routes.js";
import { aqiRouter } from "./routes/aqi.routes.js";
import { weatherRouter } from "./routes/weather.routes.js";
import { routesRouter } from "./routes/routes.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { placesRouter } from "./routes/places.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { historyRouter } from "./routes/history.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";

async function main() {
  const store = await initDataStore();
  await Promise.all([seedPlaces(), seedAdvisories()]);

  const app = express();
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", dataStore: store.backend });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/aqi", aqiRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/routes", routesRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/places", placesRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/notifications", notificationsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`AirWise API listening on http://localhost:${env.port} (data store: ${store.backend})`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
