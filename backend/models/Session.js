const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  status: {
    type: DataTypes.ENUM('WAITING', 'ACTIVE', 'FINISHED'),
    allowNull: false,
    defaultValue: 'WAITING',
  },
});

module.exports = Session;
