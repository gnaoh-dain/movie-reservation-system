import express from 'express';
import router from './routes/index';
import { env } from './configs/env';
import { logger } from './configs/logger';
import { errorHandler, cleanupUploads } from './middlewares/error';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const app = express();

app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(cookieParser());

app.use(logger());
app.use(express.json());

app.use(cleanupUploads);
app.use('/api', router);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((_req, res) => res.status(404).json({ error: 'NotFound' }));

app.use(errorHandler);
