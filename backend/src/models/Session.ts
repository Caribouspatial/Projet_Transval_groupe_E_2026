import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Session = sequelize.define('Session', {
  status: {
    type: DataTypes.ENUM('WAITING', 'ACTIVE', 'FINISHED'),
    allowNull: false,
    defaultValue: 'WAITING',
  },
  current_question_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  question_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default Session;
