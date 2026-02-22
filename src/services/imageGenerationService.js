const axios = require("axios");
const fs = require("fs");
const path = require("path");

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../images/makanan");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Indonesian to English food translations
const translations = {
  'nasi': 'rice', 'bubur': 'porridge', 'ayam': 'chicken',
  'sayuran': 'vegetables', 'sayur': 'vegetable', 'sup': 'soup',
  'telur': 'egg', 'ikan': 'fish', 'daging': 'meat',
  'tahu': 'tofu', 'tempe': 'tempeh', 'susu': 'milk',
  'buah': 'fruit', 'kentang': 'potato', 'wortel': 'carrot',
  'bayam': 'spinach', 'brokoli': 'broccoli', 'jagung': 'corn',
  'kacang': 'beans', 'keju': 'cheese', 'roti': 'bread',
  'pisang': 'banana', 'jeruk': 'orange', 'apel': 'apple',
  'mangga': 'mango', 'pepaya': 'papaya', 'melon': 'melon',
  'udang': 'shrimp', 'sapi': 'beef', 'kambing': 'lamb',
  'formula': 'formula', 'goreng': 'fried', 'rebus': 'boiled',
  'bakar': 'grilled', 'tumis': 'stir-fried', 'kukus': 'steamed',
  'panggang': 'roasted', 'semur': 'braised', 'soto': 'soup',
  'mie': 'noodles', 'bihun': 'rice noodles', 'telor': 'egg',
  'ubi': 'sweet potato', 'singkong': 'cassava', 'labu': 'pumpkin',
  'tomat': 'tomato', 'buncis': 'green beans', 'terong': 'eggplant',
  'alpukat': 'avocado', 'semangka': 'watermelon', 'stroberi': 'strawberry',
  'oat': 'oatmeal', 'yogurt': 'yogurt', 'puding': 'pudding',
  'biskuit': 'biscuit', 'sereal': 'cereal', 'bubur kacang': 'bean porridge',
};

/**
 * Translate Indonesian food name to English for better image generation
 */
function translateFoodName(namaMakanan) {
  let cleaned = namaMakanan.replace(/(dengan|dan|serta|ala|yang|untuk|di|ke|dari)/gi, ' ');

  // Sort by length (longer first) to avoid partial replacements
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  for (const indo of sortedKeys) {
    const regex = new RegExp(`\\b${indo}\\b`, 'gi');
    cleaned = cleaned.replace(regex, translations[indo]);
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned || 'healthy food';
}

/**
 * Generate a food image using Hugging Face Inference API
 * @param {string} namaMakanan - Indonesian food name
 * @returns {string|null} - Relative path to saved image, or null on failure
 */
async function generateFoodImage(namaMakanan) {
  if (!HF_API_KEY) {
    console.error("HUGGINGFACE_API_KEY tidak ditemukan di .env");
    return null;
  }

  try {
    const englishName = translateFoodName(namaMakanan);
    const prompt = `A professional food photography of ${englishName}, served on a beautiful plate, top-down view, warm lighting, appetizing, high quality, 4k`;

    console.log(`[ImageGen] Generating image for: "${namaMakanan}" -> prompt: "${prompt}"`);

    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/jpeg",
        },
        responseType: "arraybuffer",
        timeout: 120000, // 2 minutes timeout (model may need to warm up)
      }
    );

    // Check if response is an image
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.startsWith("image/")) {
      // Response might be JSON error
      const text = Buffer.from(response.data).toString("utf-8");
      console.error("[ImageGen] Non-image response:", text);
      return null;
    }

    // Save image to disk
    const sanitizedName = namaMakanan
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = Date.now();
    const filename = `ai-${sanitizedName}-${timestamp}.jpg`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, response.data);
    console.log(`[ImageGen] Image saved: ${filepath}`);

    // Return relative path (same format as multer uploads)
    return `/images/makanan/${filename}`;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 503) {
        // Model is loading — could retry, but for now return null
        const body = Buffer.from(error.response.data).toString("utf-8");
        console.error(`[ImageGen] Model sedang loading (503): ${body}`);
      } else if (status === 429) {
        console.error("[ImageGen] Rate limit tercapai (429). Coba lagi nanti.");
      } else {
        console.error(`[ImageGen] API error (${status}):`, Buffer.from(error.response.data).toString("utf-8"));
      }
    } else {
      console.error("[ImageGen] Error:", error.message);
    }
    return null;
  }
}

module.exports = { generateFoodImage, translateFoodName };
