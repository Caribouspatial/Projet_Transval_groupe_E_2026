import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    "projet",
    "root",
    "Transversale123",
    {
        host: "localhost",
        dialect: "mysql",
        logging: false
    }
);

export default sequelize;