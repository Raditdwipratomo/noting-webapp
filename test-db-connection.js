const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('Testing connection with config:', dbConfig);

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results] = await sequelize.query('SHOW CREATE TABLE standar_who');
    console.log('Table Schema:', JSON.stringify(results, null, 2));

    const [rows] = await sequelize.query('SELECT * FROM standar_who LIMIT 5');
    console.log('First 5 rows:', JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error('Unable to connect to the database or query failed:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
