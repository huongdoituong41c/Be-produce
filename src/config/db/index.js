const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const fs = require('fs')
const path = require('path')

const sequelize = new Sequelize('nokia_training', 'hotelNokia', '1234567890x@X', {
    host: 'hotel-db',
    dialect: 'mysql',
    dialectModule: mysql2,
    port: 3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const db = {};

fs.readdirSync(path.join(__dirname, '../../app/models'))
    .forEach(file => {
        // Skip files that are not models
        if (file === 'index.js' || file.endsWith('.map')) return;
        // Import model from file and add it to db object
        const model = require(path.join(__dirname, '../../app/models', file))(sequelize, Sequelize);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    // Call associate method if it exists
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
