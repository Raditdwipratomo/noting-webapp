// config/groq.js
require("dotenv").config();

/**
 * Groq AI Configuration
 */
const groqConfig = {
  // API Configuration
  apiKey: process.env.GROQ_API_KEY || "",

  // Model Configuration
  model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",

  // Generation Parameters
  maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || "2048", 10),
  temperature: parseFloat(process.env.GROQ_TEMPERATURE || "0.7"),

  // Available Models
  models: {
    // Paling pintar, best for complex tasks
    smart: "llama-3.1-70b-versatile",

    // Paling cepat, good for simple tasks
    fast: "llama-3.1-8b-instant",

    // Balance antara speed dan quality
    balanced: "mixtral-8x7b-32768",

    // Large context window
    largeContext: "llama-3.1-70b-versatile",
  },

  // Presets untuk berbagai use case
  presets: {
    // Untuk rekomendasi gizi (butuh presisi)
    nutrition: {
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
    },

    // Untuk chatbot konsultasi (lebih natural)
    chatbot: {
      model: "llama-3.1-70b-versatile",
      temperature: 0.8,
      maxTokens: 1024,
      topP: 0.95,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
    },

    // Untuk analisis data (butuh akurasi)
    analysis: {
      model: "llama-3.1-70b-versatile",
      temperature: 0.5,
      maxTokens: 1500,
      topP: 0.85,
      frequencyPenalty: 0.2,
      presencePenalty: 0.2,
    },

    // Untuk FAQ (simple & fast)
    faq: {
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      maxTokens: 512,
      topP: 0.9,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
    },
  },

  // Rate Limiting
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerDay: 14400,
  },

  // Retry Configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // ms
    backoffMultiplier: 2,
  },

  // Timeout Configuration
  timeout: {
    default: 30000, // 30 seconds
    long: 60000, // 60 seconds for complex tasks
  },
};

/**
 * Validate configuration
 */
const validateConfig = () => {
  if (!groqConfig.apiKey) {
    console.warn("⚠️  GROQ_API_KEY is not set. AI features will not work.");
    return false;
  }

  if (groqConfig.apiKey === "your_groq_api_key_here") {
    console.warn("⚠️  Please set your actual Groq API key in .env file");
    return false;
  }

  return true;
};

// Validate on load
const isValid = validateConfig();

module.exports = {
  ...groqConfig,
  isConfigured: isValid,
  validateConfig,
};
