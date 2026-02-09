import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { inspectorRoutes } from './routes/inspectors';
import { factoryRoutes } from './routes/factories';
import { taskRoutes } from './routes/tasks';
import { scheduleRoutes } from './routes/schedules';
import { statsRoutes } from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/inspectors', inspectorRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '验货排班系统运行正常' });
});

app.listen(PORT, () => {
  console.log(`验货排班系统后端服务运行在 http://localhost:${PORT}`);
});
