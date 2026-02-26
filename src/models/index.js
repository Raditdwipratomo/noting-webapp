const { Sequelize } = require("sequelize");
const config = require("../config/database");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    pool: dbConfig.pool,
    define: dbConfig.define,
  },
);

const db = {};

const safeLoadModel = (name, filePath) => {
  try {
    console.log(`Loading ${name}...`);
    const model = require(filePath)(sequelize, Sequelize.DataTypes);

    if (!model) {
      console.error(`❌ ${name}: Model returned null/undefined`);
      return null;
    }

    console.log(`✅ ${name} loaded successfully`);
    return model;
  } catch (error) {
    console.error(`❌ ${name}: Failed to load`);
    console.error(`   Error: ${error.message}`);
    console.error(`   File: ${filePath}`);
    console.error(`   Stack: ${error.stack}`);
    return null;
  }
};

// Import models
db.User = safeLoadModel("User", "./User");
db.Anak = safeLoadModel("Anak", "./Anak");
db.PertumbuhanAnak = safeLoadModel("PertumbuhanAnak", "./PertumbuhanAnak");
db.StandarWHO = safeLoadModel("StandarWHO", "./StandarWHO");
db.RiwayatDiagnosa = safeLoadModel("RiwayatDiagnosa", "./RiwayatDiagnosa");
db.RencanaGiziMingguan = safeLoadModel(
  "RencanaGiziMingguan",
  "./RencanaGiziMingguan",
);
db.RekomendasiHarian = safeLoadModel(
  "RekomendasiHarian",
  "./RekomendasiHarian",
);
db.DetailMakananHarian = safeLoadModel(
  "DetailMakananHarian",
  "./DetailMakananHarian",
);
db.NutrisiMakanan = safeLoadModel("NutrisiMakanan", "./NutrisiMakanan");
db.Reminder = safeLoadModel("Reminder", "./Reminder");
db.AlergiAnak = safeLoadModel("AlergiAnak", "./AlergiAnak");
db.ResepMakanan = safeLoadModel("ResepMakanan", "./ResepMakanan");
db.Post = safeLoadModel("Post", "./Post");
db.Like = safeLoadModel("Like", "./Like");
db.Comment = safeLoadModel("Comment", "./Comment");

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.testConnection = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Unable to connect to database: ", error);
    return false;
  }
};

db.syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log("✅ Database synchronized successfully");
    return true;
  } catch (error) {
    console.error("❌ Database sync failed:", error.message);
    return false;
  }
};

module.exports = db;
