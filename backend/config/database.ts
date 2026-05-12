import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'iot_game',
  process.env.DB_USER || 'gameadmin',
  process.env.DB_PASSWORD || 'superpassword',
  {
    host: process.env.DB_HOST || 'db',
    dialect: 'mysql',
    port: 3306,
    logging: false,
  }
);

export default sequelize;
