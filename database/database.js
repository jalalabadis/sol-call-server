const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');

// Create a new instance of Sequelize
const sequelize = new Sequelize('leadcbqt_leadsworker', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
