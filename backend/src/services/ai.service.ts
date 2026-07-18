import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { retrieveAdvisories } from "./advisories.service.js";
import { getCurrentAqi } from "./aqi.service.js";
import { getCurrentWeather } from "./weather.service.js";
import { aqiToLabel, aqiToCategory } from "../utils/aqi.util.js";
import type { ChatTurn, Coordinates, HealthProfile } from "../types/index.js";

const anthropic = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null;

const SYSTEM_PROMPT_PREFIX = `You are AirWise, an AI public-health companion for Delhi residents dealing with air pollution.
Always prioritize the user's health. Never fabricate air quality or weather data — only use the
live figures and advisory excerpts provided in context. If context is insufficient, say so plainly.
Keep answers concise (2-5 sentences), warm, and directly actionable. When relevant, reference the
person's health profile.`;

export async function generateChatReply(params: {
  message: string;
  history: ChatTurn[];
  location?: Coordinates;
  healthProfile?: HealthProfile;
}): Promise<{ reply: string; groundedOn: string[] }> {
  const { message, history, location, healthProfile } = params;

  const advisories = await retrieveAdvisories(message, 4);
  const relevantAdvisories = advisories.filter((a) => a.score > 0);

  let liveContext = "No location shared, so live AQI/weather context is unavailable.";
  if (location) {
    const [aqi, weather] = await Promise.all([
      getCurrentAqi(location),
      getCurrentWeather(location),
    ]);
    const categoryLabel = aqiToLabel(aqiToCategory(aqi.aqi));
    liveContext =
      `Current conditions at the user's location: AQI ${aqi.aqi} (${categoryLabel}), ` +
      `PM2.5 ${aqi.pm25} µg/m³, PM10 ${aqi.pm10} µg/m³. Weather: ${weather.temperatureC}°C ` +
      `(feels like ${weather.feelsLikeC}°C), ${weather.humidity}% humidity, wind ${weather.windSpeedKph} kph, ` +
      `UV index ${weather.uvIndex}, condition: ${weather.condition}.`;
  }

  const advisoryContext = relevantAdvisories.length
    ? relevantAdvisories.map((a) => `- ${a.text}`).join("\n")
    : "No closely matching advisory found — answer using general WHO/EPA AQI guidance.";

  const groundedOn = relevantAdvisories.map((a) => a.id);

  if (anthropic) {
    try {
      const systemPrompt = `${SYSTEM_PROMPT_PREFIX}

${healthProfile ? `User's health profile: ${healthProfile}.` : "User has not set a health profile."}

Live environmental context:
${liveContext}

Relevant health advisories retrieved via vector search:
${advisoryContext}`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user" as const, content: message },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        return { reply: textBlock.text, groundedOn };
      }
    } catch (err) {
      console.error("[ai.service] Anthropic call failed, falling back to rule-based reply:", err);
    }
  }

  return { reply: ruleBasedReply({ message, location, healthProfile, advisories: relevantAdvisories, liveContext }), groundedOn };
}

/**
 * Deterministic, template-based responder used when no ANTHROPIC_API_KEY is
 * configured or the live API call fails, so the chat feature never breaks.
 */
function ruleBasedReply(params: {
  message: string;
  location?: Coordinates;
  healthProfile?: HealthProfile;
  advisories: { text: string }[];
  liveContext: string;
}): string {
  const { message, advisories, liveContext } = params;
  const lower = message.toLowerCase();

  const topAdvisory = advisories[0]?.text;
  const intro = params.location
    ? liveContext.replace("Current conditions at the user's location: ", "")
    : "I don't have your current location, so this is general guidance.";

  let focus = "Here's what I'd suggest based on current guidance:";
  if (lower.includes("run") || lower.includes("jog")) focus = "On running outdoors:";
  else if (lower.includes("cycl") || lower.includes("bike")) focus = "On cycling outdoors:";
  else if (lower.includes("mask") || lower.includes("n95")) focus = "On masks:";
  else if (lower.includes("child") || lower.includes("kid")) focus = "For children:";
  else if (lower.includes("purifier")) focus = "On air purifiers:";
  else if (lower.includes("window")) focus = "On windows/ventilation:";
  else if (lower.includes("route") || lower.includes("drive") || lower.includes("commute"))
    focus = "On choosing a route:";

  return [
    intro,
    focus,
    topAdvisory ?? "Keep an eye on the live AQI reading and prefer indoor activity above AQI 150.",
  ]
    .filter(Boolean)
    .join(" ");
}
