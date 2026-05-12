import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const ResponseLog = sequelize.define('ResponseLog', {
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  choice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  response_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default ResponseLog;
