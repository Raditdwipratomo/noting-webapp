// sync-db.js
const db = require('./src/models');

async function recreateTables() {
  try {
    console.log('🔄 Sedang menyinkronkan database...');
    
    // Opsi { force: true } akan mendrop tabel jika ada, lalu membuatnya lagi
    // Opsi { alter: true } akan mengubah struktur tabel tanpa menghapus data (jika memungkinkan)
    await db.sequelize.sync({ force: true });
    
    console.log('✅ Semua tabel berhasil dibuat ulang berdasarkan model!');
  } catch (error) {
    console.error('❌ Gagal membuat tabel:', error);
  } finally {
    await db.sequelize.close();
  }
}

recreateTables();