import { env } from "../config/env.js";
import { retrieveAdvisories } from "./advisories.service.js";
import { getCurrentAqi } from "./aqi.service.js";
import { getCurrentWeather } from "./weather.service.js";
import { aqiToLabel, aqiToCategory } from "../utils/aqi.util.js";
import type { ChatTurn, Coordinates, HealthProfile } from "../types/index.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT_PREFIX = `You are AirWise, an AI public-health companion for Delhi residents dealing with air pollution.
Always prioritize the user's health. Never fabricate air quality or weather data — only use the
live figures and advisory excerpts provided in context. If context is insufficient, say so plainly.
Keep answers concise (2-5 sentences), warm, and directly actionable. When relevant, reference the
person's health profile.`;

/**
 * Backup free models tried, in order, when the configured model is congested.
 * OpenRouter's free tier frequently returns "Provider returned error" (429)
 * on any single model, so cycling through a few keeps the LLM path alive far
 * more often than relying on one. All are clean, non-reasoning-leaking
 * instruct/chat models. Anything not reachable just falls through to the next,
 * and ultimately to the rule-based responder.
 */
const FALLBACK_MODELS = [
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

async function callModel(
  model: string,
  systemPrompt: string,
  history: ChatTurn[],
  message: string
): Promise<string | null> {
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openrouterApiKey}`,
        "Content-Type": "application/json",
        // Optional attribution headers OpenRouter uses for its dashboard.
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AirWise AI",
      },
      body: JSON.stringify({
        // Generous budget: some free models (e.g. gpt-oss) are reasoning
        // models that spend tokens thinking before the visible answer, so a
        // low cap truncates the reply mid-sentence.
        model,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      console.warn(`[ai.service] ${model} returned ${res.status}, trying next model.`);
      return null;
    }
    const json = (await res.json()) as any;
    const reply = json.choices?.[0]?.message?.content;
    return typeof reply === "string" && reply.trim().length > 0 ? reply.trim() : null;
  } catch (err) {
    console.warn(`[ai.service] ${model} request failed, trying next model:`, err);
    return null;
  }
}

/**
 * Calls OpenRouter's OpenAI-compatible chat completions endpoint, trying the
 * configured model first and then a short list of backup free models. Returns
 * null only if every model fails, so the caller transparently falls back to
 * the rule-based responder.
 */
async function callOpenRouter(systemPrompt: string, history: ChatTurn[], message: string): Promise<string | null> {
  if (!env.openrouterApiKey) return null;
  const models = [env.openrouterModel, ...FALLBACK_MODELS].filter((m, i, arr) => arr.indexOf(m) === i);
  for (const model of models) {
    const reply = await callModel(model, systemPrompt, history, message);
    if (reply) return reply;
  }
  console.error("[ai.service] All OpenRouter models unavailable, falling back to rule-based reply.");
  return null;
}

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

  const systemPrompt = `${SYSTEM_PROMPT_PREFIX}

${healthProfile ? `User's health profile: ${healthProfile}.` : "User has not set a health profile."}

Live environmental context:
${liveContext}

Relevant health advisories retrieved via vector search:
${advisoryContext}`;

  const llmReply = await callOpenRouter(systemPrompt, history, message);
  if (llmReply) {
    return { reply: llmReply, groundedOn };
  }

  return { reply: ruleBasedReply({ message, location, healthProfile, advisories: relevantAdvisories, liveContext }), groundedOn };
}

/**
 * Deterministic, template-based responder used when no OPENROUTER_API_KEY is
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
