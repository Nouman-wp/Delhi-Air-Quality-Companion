import "dotenv/config";

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const env = {
  port: Number(optional("PORT") ?? 4000),
  clientOrigin: optional("CLIENT_ORIGIN") ?? "http://localhost:5173",
  jwtSecret: optional("JWT_SECRET") ?? "dev-insecure-secret-change-me",
  nodeEnv: optional("NODE_ENV") ?? "development",

  elasticsearchNode: optional("ELASTICSEARCH_NODE"),
  elasticsearchApiKey: optional("ELASTICSEARCH_API_KEY"),
  elasticsearchUsername: optional("ELASTICSEARCH_USERNAME"),
  elasticsearchPassword: optional("ELASTICSEARCH_PASSWORD"),

  waqiToken: optional("WAQI_TOKEN"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
} as const;

export const isProduction = env.nodeEnv === "production";
