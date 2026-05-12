import { Sequelize } from 'sequelize';
import { env } from './env';

const sequelize = new Sequelize(
  env.DB_NAME || 'iot_game',
  env.DB_USER || 'gameadmin',
  env.DB_PASSWORD || 'superpassword',
  {
    host: env.DB_HOST || 'db',
    dialect: 'mysql',
    port: 3306,
    logging: false,
  }
);

export default sequelize;
