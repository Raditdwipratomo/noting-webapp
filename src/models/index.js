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
  }
);

const db = {};

// Import models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Anak = require("./Anak")(sequelize, Sequelize.DataTypes);
db.PertumbuhanAnak = require("./PertumbuhanAnak")(
  sequelize,
  Sequelize.DataTypes
);
db.StandarWHO = require("./StandarWHO")(sequelize, Sequelize.DataTypes);
db.RiwayatDiagnosa = require("./RiwayatDiagnosa")(
  sequelize,
  Sequelize.DataTypes
);
db.RencanaGiziMingguan = require("./RencanaGiziMingguan")(
  sequelize,
  Sequelize.DataTypes
);
db.RekomendasiHarian = require("./RekomendasiHarian")(
  sequelize,
  Sequelize.DataTypes
);
db.DetailMakananHarian = require("./DetailMakananHarian")(
  sequelize,
  Sequelize.DataTypes
);
db.NutrisiMakanan = require("./NutrisiMakanan")(sequelize, Sequelize.DataTypes);
db.ReminderMakan = require("./ReminderMakan")(sequelize, Sequelize.DataTypes);
db.AlergiAnak = require("./AlergiAnak")(sequelize, Sequelize.DataTypes);

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
