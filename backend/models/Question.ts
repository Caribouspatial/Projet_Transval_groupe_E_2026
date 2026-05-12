import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Question = sequelize.define('Question', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  option_a: { type: DataTypes.STRING, allowNull: false },
  option_b: { type: DataTypes.STRING, allowNull: false },
  option_c: { type: DataTypes.STRING, allowNull: false },
  option_d: { type: DataTypes.STRING, allowNull: false },
  correct_answer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
});

export default Question;
