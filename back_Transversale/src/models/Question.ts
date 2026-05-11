import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Question extends Model {}

Question.init(
{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    question: {
        type: DataTypes.STRING,
        allowNull: false
    },

    choices: {
        type: DataTypes.JSON,
        allowNull: false
    },

    answer: {
        type: DataTypes.STRING,
        allowNull: false
    },

    categorie: {
        type: DataTypes.STRING
    }
},
{
    sequelize,
    tableName: 'questions',
    timestamps: true
}
);

export default Question;