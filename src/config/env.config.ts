import dotenv from "dotenv";

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 8090),
  APP_URL: required("APP_URL"),
  GROQ_API_KEY: required("GROQ_API_KEY"),

  // Database
  MONGO_URI: required("MONGO_URI"),

  // AI
  AI_PROVIDER: process.env.AI_PROVIDER || "openrouter",
  AI_API_KEY: required("AI_API_KEY"),
  AI_BASE_URL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",

  // Auth
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Rate limit
  RATE_LIMIT_WINDOW_MS: Number(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
  ),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100),
};
