/**
 * Script untuk me-reset semua gambar_url lama (URL external)
 * ke null agar bisa di-generate ulang via Hugging Face
 */
require("dotenv").config();
const db = require("../src/models");

async function resetImageUrls() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Reset all gambar_url that are external URLs (start with http) or pollinations URLs
    const [updatedCount] = await db.DetailMakananHarian.update(
      { gambar_url: null },
      {
        where: db.sequelize.literal(
          "gambar_url IS NOT NULL AND gambar_url LIKE 'http%'"
        ),
      }
    );

    console.log(`✅ Reset ${updatedCount} records to null.`);
    console.log("   Gambar akan di-generate ulang via Hugging Face saat user membuka detail resep.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetImageUrls();
