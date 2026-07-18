import { apiClient } from "./client";
import type { ChatTurn, Coordinates } from "../../types";

export async function sendChatMessage(params: {
  message: string;
  history: ChatTurn[];
  location?: Coordinates;
}): Promise<{ reply: string; groundedOn: string[] }> {
  const res = await apiClient.post("/chat", params);
  return res.data;
}
