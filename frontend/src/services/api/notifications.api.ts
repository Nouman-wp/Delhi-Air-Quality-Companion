import { apiClient } from "./client";
import type { Coordinates, SmartNotification } from "../../types";

export async function getSmartNotifications(coords: Coordinates): Promise<SmartNotification[]> {
  const res = await apiClient.get("/notifications", { params: coords });
  return res.data.notifications;
}
