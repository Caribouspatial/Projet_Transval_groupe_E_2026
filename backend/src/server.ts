import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import './config/env';
import { initDb } from './services/initDb';
import { initMqtt } from './services/mqtt.service';
import { setGameIo } from './services/game.service';
import Session from './models/Session';
import Participant from './models/Participant';
import Question from './models/Question';
import Quiz from './models/Quiz';
import ResponseLog from './models/ResponseLog';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/questions.routes';
import quizzesRoutes from './routes/quizzes.routes';
import participantsRoutes from './routes/participants.routes';
import sessionRoutes from './routes/session.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.use(express.json());

// socketId → participant_id, populated when client emits 'register'
const socketParticipants = new Map<string, number>();

io.on('connection', (socket) => {
  socket.emit('connected', { ok: true });

  socket.on('register', (participantId: number) => {
    socketParticipants.set(socket.id, participantId);
  });

  socket.on('disconnect', () => {
    const participantId = socketParticipants.get(socket.id);
    if (participantId !== undefined) {
      io.emit('participant_disconnected', { participant_id: participantId });
      socketParticipants.delete(socket.id);
    }
  });
});

setGameIo(io);

Quiz.hasMany(Question, { foreignKey: 'quiz_id' });
Question.belongsTo(Quiz, { foreignKey: 'quiz_id' });

Session.hasMany(Participant, { foreignKey: 'session_id' });
Participant.belongsTo(Session, { foreignKey: 'session_id' });
Session.belongsTo(Question, { foreignKey: 'current_question_id' });

Participant.hasMany(ResponseLog, { foreignKey: 'participant_id' });
ResponseLog.belongsTo(Participant, { foreignKey: 'participant_id' });
Question.hasMany(ResponseLog, { foreignKey: 'question_id' });
ResponseLog.belongsTo(Question, { foreignKey: 'question_id' });

app.use(healthRoutes);
app.use('/api', authRoutes);
app.use('/api', questionRoutes);
app.use('/api', quizzesRoutes);
app.use('/api', participantsRoutes);
app.use('/api', sessionRoutes);

const port = Number(process.env.BACKEND_PORT) || 3000;

const start = async () => {
  try {
    await initDb();
    initMqtt();
    server.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error('Database error:', err);
  }
};

start();
