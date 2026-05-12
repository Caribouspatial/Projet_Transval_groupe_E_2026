import dotenv from 'dotenv';

dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from './config/database';
import Question from './models/Question';
import User from './models/User';
import Participant from './models/Participant';
import Session from './models/Session';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());

const jwtSecret = process.env.JWT_SECRET || 'devsecret';
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

app.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  socket.emit('connected', { ok: true });
});

const port = Number(process.env.BACKEND_PORT) || 3000;

Session.hasMany(Participant, { foreignKey: 'session_id' });
Participant.belongsTo(Session, { foreignKey: 'session_id' });

const authRequired = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = header.replace('Bearer ', '');
  try {
    (req as { user?: unknown }).user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.get('password_hash') as string);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.get('id'), username: user.get('username'), role: user.get('role') },
    jwtSecret,
    { expiresIn: '8h' }
  );

  return res.json({ token });
});

app.get('/api/questions', authRequired, async (req: Request, res: Response) => {
  const questions = await Question.findAll({ order: [['id', 'ASC']] });
  res.json(questions);
});

app.post('/api/questions', authRequired, async (req: Request, res: Response) => {
  const payload = req.body || {};
  const required = [
    'text',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_answer',
  ];

  const missing = required.filter((key) => !payload[key]);
  if (missing.length > 0) {
    return res.status(400).json({ error: 'Missing fields', fields: missing });
  }

  const question = await Question.create({
    text: payload.text,
    option_a: payload.option_a,
    option_b: payload.option_b,
    option_c: payload.option_c,
    option_d: payload.option_d,
    correct_answer: payload.correct_answer,
    points: payload.points ?? 10,
  });

  return res.status(201).json(question);
});

app.delete('/api/questions/:id', authRequired, async (req: Request, res: Response) => {
  const deleted = await Question.destroy({ where: { id: req.params.id } });
  if (!deleted) {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.json({ ok: true });
});

const initDB = async () => {
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
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const start = async () => {
  try {
    await initDB();
    server.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error('Database error:', err);
  }
};

start();
