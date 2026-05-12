import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Session = sequelize.define('Session', {
  status: {
    type: DataTypes.ENUM('WAITING', 'ACTIVE', 'FINISHED'),
    allowNull: false,
    defaultValue: 'WAITING',
  },
});

export default Session;
