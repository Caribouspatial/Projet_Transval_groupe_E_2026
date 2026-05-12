import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class PendingQuestion extends Model {}

PendingQuestion.init(
{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    question: {
        type: DataTypes.TEXT,
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
        type: DataTypes.STRING,
        allowNull: true
    }
},
{
    sequelize,
    tableName: "pending_questions",
    timestamps: true
}
);

export default PendingQuestion;