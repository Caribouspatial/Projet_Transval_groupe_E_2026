import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    public id!: number;
    public prenom!: string;
    public nom!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true,
    }
);

export default User;