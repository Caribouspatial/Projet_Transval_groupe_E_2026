import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import './config/env';
import { initDb } from './services/initDb';
import Session from './models/Session';
import Participant from './models/Participant';
import Question from './models/Question';
import ResponseLog from './models/ResponseLog';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/questions.routes';
import participantsRoutes from './routes/participants.routes';
import sessionRoutes from './routes/session.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());

io.on('connection', (socket) => {
  socket.emit('connected', { ok: true });
});

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
app.use('/api', participantsRoutes);
app.use('/api', sessionRoutes);

const port = Number(process.env.BACKEND_PORT) || 3000;

const start = async () => {
  try {
    await initDb();
    server.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (err) {
    console.error('Database error:', err);
  }
};

start();
