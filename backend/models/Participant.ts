import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Participant = sequelize.define('Participant', {
  pseudo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buzzer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export default Participant;
