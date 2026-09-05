import express from 'express';
import router from './routes/index';
import { logger } from './configs/logger';
import { errorHandler } from './middlewares/error';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './configs/env';

export const app = express();

app.use(cors({ origin: ['*'], credentials: true }));
app.use(cookieParser());

app.use(logger());
app.use(express.json());

app.use('/uploads', express.static(env.upload.dir));
app.use('/api', router);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);
