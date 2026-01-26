// services/GroqAIService.js
const Groq = require("groq-sdk");
const groqConfig = require("../config/groq");

/**
 * Groq AI Service
 * Service utama untuk interaksi dengan Groq API
 */
class GroqAIService {
  constructor() {
    if (!groqConfig.isConfigured) {
      console.error("❌ Groq API is not configured properly");
      this.client = null;
      return;
    }

    // Initialize Groq client
    this.client = new Groq({
      apiKey: groqConfig.apiKey,
    });

    // Chat sessions storage (in-memory)
    this.sessions = new Map();

    console.log("✅ Groq AI Service initialized");
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.client !== null && groqConfig.isConfigured;
  }

  /**
   * Generate chat completion
   */
  async chat(messages, options = {}) {
    if (!this.isAvailable()) {
      throw new Error("Groq AI service is not configured");
    }

    try {
      const preset = options.preset || "chatbot";
      const config = groqConfig.presets[preset] || groqConfig.presets.chatbot;

      const completion = await this.client.chat.completions.create({
        messages,
        model: options.model || config.model,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens || config.maxTokens,
        top_p: options.topP ?? config.topP,
        frequency_penalty: options.frequencyPenalty ?? config.frequencyPenalty,
        presence_penalty: options.presencePenalty ?? config.presencePenalty,
        stream: options.stream || false,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error in Groq chat:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Generate chat with retry mechanism
   */
  async chatWithRetry(messages, options = {}, retryCount = 0) {
    try {
      return await this.chat(messages, options);
    } catch (error) {
      if (retryCount < groqConfig.retry.maxRetries) {
        const delay =
          groqConfig.retry.retryDelay *
          Math.pow(groqConfig.retry.backoffMultiplier, retryCount);

        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1})`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.chatWithRetry(messages, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Get or create chat session
   */
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [],
        createdAt: new Date(),
      });
    }
    return this.sessions.get(sessionId);
  }

  /**
   * Add message to session
   */
  addToSession(sessionId, role, content) {
    const session = this.getSession(sessionId);
    session.messages.push({ role, content });
    return session;
  }

  /**
   * Clear session
   */
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Chat with session context
   */
  async chatWithSession(sessionId, userMessage, options = {}) {
    if (!this.isAvailable()) {
      throw new Error("Groq AI service is not configured");
    }

    try {
      // Get session
      const session = this.getSession(sessionId);

      // Add user message
      this.addToSession(sessionId, "user", userMessage);

      // Generate response
      const response = await this.chatWithRetry(session.messages, options);

      // Add assistant response to session
      this.addToSession(sessionId, "assistant", response);

      return response;
    } catch (error) {
      console.error("Error in session chat:", error);
      throw error;
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error("Groq AI service is not configured");
    }

    try {
      const systemPrompt = `You are a helpful assistant that ALWAYS responds with VALID JSON only. 
Never include any text, explanation, or markdown formatting before or after the JSON.
The response must start with { and end with }.`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ];

      const response = await this.chatWithRetry(messages, {
        ...options,
        preset: "analysis",
        temperature: 0.5, // Lower temperature for more consistent JSON
      });

      // Clean response - remove markdown if present
      let cleanResponse = response
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Parse JSON
      const parsed = JSON.parse(cleanResponse);
      return parsed;
    } catch (error) {
      console.error("Error generating JSON:", error);
      console.error("Response was:", response);
      throw new Error("Failed to generate valid JSON response");
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: "Groq AI is not configured",
      };
    }

    try {
      const response = await this.chat(
        [{ role: "user", content: "Halo! Tes koneksi." }],
        { preset: "faq", maxTokens: 50 },
      );

      return {
        success: true,
        message: "Connection successful",
        response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Error handler
   */
  _handleError(error) {
    if (error.status === 401) {
      return new Error("Invalid Groq API key");
    }
    if (error.status === 429) {
      return new Error("Rate limit exceeded. Please try again later.");
    }
    if (error.status === 500) {
      return new Error("Groq service error. Please try again later.");
    }
    return error;
  }

  /**
   * Get service stats
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      isConfigured: groqConfig.isConfigured,
      model: groqConfig.model,
    };
  }
}

// Singleton instance
let instance = null;

const getGroqService = () => {
  if (!instance) {
    instance = new GroqAIService();
  }
  return instance;
};

module.exports = getGroqService();
