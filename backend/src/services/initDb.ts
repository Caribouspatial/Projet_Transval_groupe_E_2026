import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { adminPassword, adminUsername } from '../config/auth';
import Question from '../models/Question';
import User from '../models/User';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const initDb = async () => {
  let connected = false;

  while (!connected) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      console.log('MySQL tables synchronized');
      connected = true;

      const userCount = await User.count();
      if (userCount === 0) {
        const password_hash = await bcrypt.hash(adminPassword, 10);
        await User.create({
          username: adminUsername,
          password_hash,
          role: 'admin',
        });
        console.log('Admin user created');
      }

      const count = await Question.count();
      if (count === 0) {
        await Question.create({
          text: 'Quelle est la capitale de la Belgique ?',
          option_a: 'Anvers',
          option_b: 'Bruxelles',
          option_c: 'Liege',
          option_d: 'Namur',
          correct_answer: 'B',
          points: 10,
        });
        console.log('Seed question inserted');
      }
    } catch (error) {
      console.log('MySQL not ready yet. Retrying in 5 seconds.');
      await sleep(5000);
    }
  }
};
