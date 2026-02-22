/**
 * Script untuk mengecek isi gambar_url di database
 */
require("dotenv").config();
const db = require("../src/models");

async function checkUrls() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected\n");

    const records = await db.DetailMakananHarian.findAll({
      attributes: ["id_detail", "nama_makanan", "gambar_url"],
      limit: 10,
    });

    console.log(`Total records fetched: ${records.length}\n`);
    records.forEach((r) => {
      console.log(`ID: ${r.id_detail}`);
      console.log(`  Nama: ${r.nama_makanan}`);
      console.log(`  URL:  ${r.gambar_url}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUrls();
