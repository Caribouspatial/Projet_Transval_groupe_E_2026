import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Quiz = sequelize.define('Quiz', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'Zap',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Quiz;
